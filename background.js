//  브라우저 영역에서 작동하는 스크립트이다.

function playSuccessAudio(){
    var audio = new Audio();
//     Audio객체를 사용하여 재생/일시 정지 등을 컨트롤한다.
//     단 크롬 브라우저의 경우 명시적인 액션이 없으면 작동하지 않는다.
    audio.src = chrome.runtime.getURL("success.wav");
    //  음원 파일 설정
    aduio.play();
//     음원 파일 재생
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    console.log("message receive : "+ message);
    // 조건에 대해서는 message가 true인지 false인지의 확인가 message의 키중 type의 값이 palySuccessaudio인지에 대한 조건이다.
    if(message && message.type=='playSuccessAudio'){
        playSuccessAudio();
    }
    sendResponse(true);
})