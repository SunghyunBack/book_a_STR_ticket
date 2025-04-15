// content script로 보며 이름 변경은 가능하다.
// 이 파일을 이용해서 현재 페이지의 DOM에서 특정 Element의 정보를 얻거나,
//  얻은 정보로 DOM을 조작할수 있게 해준다.
//  createElement로 Element를 생성하여 원하는 UI를 추가할수도 있다.

var idOfTimeOut;
var globalFlag = false;
const refreshInterval = 2200; //ms 새로고침에 대한 시간을 가리킨다.

// 버튼을 만들고 페이지의 상태마다 필요한 내용에 대한 함수를 정의했다.
function makeStartButton() {
    var startButton = document.createElement("button");
    // class 의 값들은 부트스트랩 값들이다.
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");

    if (globalFlag) {
        startButton.innerText = "중지";
    } else {
        startButton.innerText = "시작";
    }

    // 시작, 중지 그리고 1개라도 선택 되어있지 않다면 작동하지 않게 하기 위한 이벤트핸들러를 정의했다.
    startButton.addEventListener("click", function (event) {
        if (globalFlag) {
            updateStatus(false);
        } else {
            if (alLeastOneCheck()) {
                updateStatus(true);
            } else {
                alert("체크된 항목이 없습니다.")
            }
        }
    });
    return startButton;
}




// 새로고침을 위한 함수 구현이다.
// timeoutPeriod은 타임아웃주긴 인자이다.
// 여기서 알아야 하는게 함수를 정의할때 인자값에 대해서 조금더 생각해바야한다.!!!
function refreshPageAfter(timeoutPeriod) {
    // location.reload()메소드는 페이지 새로고침을 할때 사용한다.
    // 그중 true로 인해 캐시가 있더라도 서버의 최신 콘텐츠를 얻을수 있다.
    //  단점으로 콘텐츠를 날려 데이터를 잃거나 깜빡거려 경험에 영향을 줄수 있다.
    // setTimeOut()는 어떤 코드를 바로 실행하지 않고 일정 시간 기다린 후 실행하고 싶을때 사용하는 코드이다.
    idOfTimeOut = setTimeout("location.reload(true);", timeoutPeriod);
}



//  updateStatus()에 대한 함수를 정의한다.
function updateStatus(status) {
    // 나중에 만들어질 체크 박스를 의미한다.
    var checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
    var checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");
    // 체크되어진 박스를 담을 list이다.
    var firstClassList = [];
    var economyClassList = [];


    if (status) {
        for (var i = 0; i < checkboxesForFirstClass.length; ++i) {
            if (checkboxesForFirstClass[i].checked) {
                // 웹페이지 상 parent는 1행을 뜻한다.
                // 웹페이지 상 trainNumber은 열차번호를 뜻한다. 그래서
                //  웹페이지의 구조를 보고 checkboxesForFirstClass의 순서는 상관없지만 두번 거슬러 올라가면 tr을 가리킬수 있다.
                //  가리킨 tr에서 2번째 자식은 언제나 trainNumber을 뜻한다.
                const parent = checkboxesForFirstClass[i].parentElement.parentElement; // tr td input 이라서 두번 거슬러 올라간다.
                const trainNumber = parent.children[2].innerText;
                firstClassList.push(trainNumber);
            }
        }

        for (var i = 0; i < checkboxesForEconomyClass.length; ++i) {
            if (checkboxesForEconomyClass[i].checked) {
                const parent = checkboxesForEconomyClass[i].parentElement.parentElement;
                const trainNumber = parent.children[2].innerText;
                economyClassList.push(trainNumber);
            }
        }
    }

    // chrome.storage API이다. 외우기 보다는 어떻게 활용하고 사용할수 잇는지를 공부해야한다.
    // 그리고 이 API를 사용하기 위해서는 매니페스트에서 권환을 선언해야한다.!!!!!

    // chrome.storage.syne.set을 사용하여 데이터를 저장한다.
    // mData라는 키에 객체로 저장한다.
    //  저장 완료 후 콜백 함수를 호출한다.
    chrome.storage.sync.set({
        mData: {
            flag: status,
            firstClassList: firstClassList,
            economyClassList: economyClassList
        }
    }, function () {
        globalFlag = status;
        startButton = document.getElementById("mStartButton");
        if (status) {
            startButton.innerText = "중지";
            location.reload(true);
        } else {
            startButton.innerText = "시작";
            clearTimeout(idOfTimeOut);
        }
        console.log("status setting completed : " + status + ", firstClassList : " + firstClassList + ", economyClassList : " + economyClassList);
    });
}


// 대상들을 지정 및 생성?
function doJob(firstClassList, economyClassList) {
    if (globalFlag) {
        // SRT 예매 페이지의 세션 타임아웃(약 3분)을 방지하기 위한 새로고침 설정
        // window.onload는 웹 브라우저 내의 모든 요소가 준비가 되어야 실행 할수 있도록 하는것이다.
        // 웹 브라우저 내의 모든 요소가 준비된 이후 지정된 시간이 지나면 새로고침을 하겠다는 의미이다.
        window.onload = refreshPageAfter(refreshInterval);
    }

    // SRT 예매 페이지의 메인 컨텐츠 영역 선택
    // sub_con_area는 열차 조회 결과가 표시되는 테이블을 포함하는 영역
    var parentForAddingStartButton = document.getElementsByClassName("sub_con_area")[0];
    var startButton = makeStartButton();
    // 선택한 sub_con_area의 클래스 이름을 가진 태그 자식 태그를 하나 만드는데 위에 정의했던 startButton을 정의하겠다.
    // 이로 인해 내가 원하는 자리에 버튼이 생성되게 되었다.
    parentForAddingStartButton.appendChild(startButton);

    // SRT 예매 페이지의 열차 조회 결과 테이블의 tbody 선택
    var tbodyList = document.getElementsByTagName("tbody");
    if (tbodyList.length == 0 && globalFlag) {
        updateStatus(false);
        return;
    }

    // 각 열차 정보 행(tr)을 순회
    var searchedRows = tbodyList[0].children;
    var targetButtons = [];

    for (var i = 0; i < searchedRows.length; ++i) {
        var row = searchedRows[i];
        // SRT 열차 번호 (예: SRT-123)
        var trainNumber = row.children[2].innerText;
        // 특실(1등석) 좌석 정보가 있는 td
        var tdForFirstClass = row.children[5];
        // 일반실(2등석) 좌석 정보가 있는 td
        var tdForEconomyClass = row.children[6];

        // 특실 예약 체크박스 생성
        checkBtn = document.createElement("input");
        checkBtn.setAttribute("type", "checkbox");
        checkBtn.setAttribute("class", "mCheckboxForFirstClass");

        if (firstClassList.includes(trainNumber)) {
            checkBtn.checked = true;
            // 특실 예약 버튼(a 태그) 선택 - 예약하기 버튼만 선택
            var firstClassButtons = tdForFirstClass.getElementsByTagName("a");
            for (var j = 0; j < firstClassButtons.length; j++) {
                var button = firstClassButtons[j];
                // '예약하기' 버튼만 선택 (class가 'btn_small btn_burgundy_dark'인 버튼)
                if (button.className.includes('btn_burgundy_dark')) {
                    targetButtons.push([button]);
                }
            }
        }
        tdForFirstClass.insertBefore(checkBtn, tdForFirstClass.firstChild);

        // 일반실 예약 체크박스 생성
        checkBtn2 = document.createElement("input");
        checkBtn2.setAttribute("type", "checkbox");
        checkBtn2.setAttribute("class", "mCheckboxForEconomyClass");

        if (economyClassList.includes(trainNumber)) {
            checkBtn2.checked = true;
            // 일반실 예약 버튼(a 태그) 선택 - 예약하기 버튼만 선택
            var economyButtons = tdForEconomyClass.getElementsByTagName("a");
            for (var j = 0; j < economyButtons.length; j++) {
                var button = economyButtons[j];
                // '예약하기' 버튼만 선택 (class가 'btn_small btn_burgundy_dark'인 버튼)
                if (button.className.includes('btn_burgundy_dark')) {
                    targetButtons.push([button]);
                }
            }
        }
        tdForEconomyClass.insertBefore(checkBtn2, tdForEconomyClass.firstChild);

        if (globalFlag) {
            console.log("test");
            checkBtn.onclick = canNotModifyCheckBox;
            checkBtn2.onclick = canNotModifyCheckBox;
        }
    }

    targetButtons = targetButtons.flat(); //평탄화
    if (targetButtons.length <= 0) {
        console.log("flag down");
        updateStatus(false);
    }

    // 선택된 예약 버튼 클릭 처리
    for (var i = 0; i < targetButtons.length; ++i) {
        console.log(targetButtons[i])
        var onClickAttr = targetButtons[i].getAttribute('onclick');
        // SRT 예매 페이지의 예약 버튼 onclick 이벤트 확인
        if (onClickAttr && onClickAttr.startsWith("reservationAfterMsg")) {
            targetButtons[i].click();
            updateStatus(false);
            // 예약 성공 시 알림음 재생
            chrome.runtime.sendMessage({ type: 'playSccessAudio' }, function (data) {
            });
        }
    }
}

function canNotModifyCheckBox() {
    if (globalFlag) {
        alert("작동 중 수정은 불가능 합니다.");
        return false;
    }
}

function alLeastOneCheck() {
    const checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
    const checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");

    for (var i = 0; i < checkboxesForFirstClass.length; ++i) {
        if (checkboxesForFirstClass[i].checked) {
            return true;
        }
    }
    for (var i = 0; i < checkboxesForEconomyClass.length; ++i) {
        return true;
    }
    return false;
}


// chrome.storage API이다. 외우기 보다는 어떻게 활용하고 사용할수 잇는지를 공부해야한다.
// 그리고 이 API를 사용하기 위해서는 매니페스트에서 권환을 선언해야한다.!!!!!
// chrome.storage.syne.get을 사용하여 저장된 데이터를 가지고 온다.

chrome.storage.sync.get('mData', function (result) {
    globalFlag = false;
    var firstClassList = [];
    var economyClassList = [];

    if (result.mData) {
        globalFlag = result.mData.flag;


        if (Array.isArray(result.mData.firstClassList)) {
            firstClassList = result.mData.firstClassList;
        }
        if (Array.isArray(result.mData.economyClassList)) {
            economyClassList = result.mData.economyClassList;
        }
    }

    console.log("flag:" + globalFlag + ", fList:" + firstClassList + ", eList:" + economyClassList);
    doJob(firstClassList, economyClassList);
});
