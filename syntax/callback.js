const a = function() {
    console.log('a');
}


function slow(callback) {
    callback();
}

slow(a)