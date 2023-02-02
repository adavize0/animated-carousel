/** Straight out of youtube lol 
* https://www.youtube.com/watch?v=cjIswDCKgu0 */
function debounce(cb, delay = 1000){
    let timeout;

    return function(...args){
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            cb(...args)
        }, delay);
    }
}

function throttle(cb, delay = 1000){
    let shouldWait = false;
    let waitingArgs = null;

    const timeoutFunc = function(){
        if(waitingArgs === null){
            shouldWait = false;
        } else {
            cb(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, delay)
        }
    }

    return function(...args) {
        if(shouldWait) {
            waitingArgs = args
            return
        };

        cb(...args)
        shouldWait = true

        setTimeout(timeoutFunc, delay)
    }
}