var ruleSet;

// populate ruleset
chrome.storage.sync.get(null, function(data) {
    if (typeof data.rules === 'undefined') {
        chrome.storage.sync.set({
            'rules': []
        });

        ruleSet = [];
    } else {
        ruleSet = data.rules;
    }
});

/**
 * In the broad strokes, we want to keep track of each keypress by the user.
 * On spacebar check if the last space-surrounded sequence is in our
 * array of keys to replace. If it is, adjust the input to leave them with the
 * replacement and the space they made. If they hit backspace as the first
 * entry after a replacement, undo the replacement.
**/

var backOut = ''; // hold the text if they want to back out
function handleKeyPress(event){
    var srcElement = event.srcElement;
    if(srcElement.type != 'text' && srcElement.type != 'textarea'){
        return;
    }

    if(event.keyCode === 32){
        // spacebar
        var words = srcElement.value.split(' ');
        var lastWord = words[words.length - 1];

        var replacement = checkReplacement(lastWord);
        if(replacement){
            // we have a match
            var location = srcElement.value.lastIndexOf(lastWord);
            backOut = srcElement.value;
            srcElement.value = srcElement.value.substring(0, location) + replacement;
        }

    } else if(event.keyCode === 8){
        // backspace... time to back it out
        if(backOut){
            // we have backout text; put it in
            event.preventDefault(); // we don't actually want that backspace getting through
            srcElement.value = backOut + ' ';
            backOut = null;
        }
    } else {
        backOut = null; // zero the backout if they like everything
    }
}

// see if we have a replacement for the string; if so, return it
function checkReplacement(search){
    for(var i = 0; i < ruleSet.length; i++){
        if(ruleSet[i].searchString == search){
            return ruleSet[i].replaceString;
        }
    }

    return null;
}

// bind the listener
document.addEventListener('keydown', handleKeyPress);
