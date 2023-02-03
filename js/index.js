if(isTouchDevice()){
    setTimeout(showSwipableAlert, 2000)
}

function showSwipableAlert(){
    const toast = document.getElementById('js-toast-outlet');
    const infoText = document.createElement('p')
    infoText.innerText = "You can swipe to change slides on your touch device";

    toast.appendChild(infoText)
    infoText.parentElement.classList.add('active')
    infoText.style.lineHeight = '130%'

    setTimeout(function(){
        infoText.parentElement.classList.remove('active')
        infoText.remove()
    }, 5000)
}