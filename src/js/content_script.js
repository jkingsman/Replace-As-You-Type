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

function moveCursorToEnd(srcElement) {
    var range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(srcElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    var selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);
}

/**
 * In the broad strokes, we want to keep track of each keypress by the user.
 * On spacebar check if the last space-surrounded sequence is in our
 * array of keys to replace. If it is, adjust the input to leave them with the
 * replacement and the space they made. If they hit backspace as the first
 * entry after a replacement, undo the replacement.
**/

var backOut = ''; // hold the text if they want to back out
var isEditableDiv = false;

function handleKeyPress(event){
    var srcElement = event.srcElement;

    if (srcElement.tagName == "DIV" && srcElement.isContentEditable){
        isEditableDiv = true;
    } else {
        isEditableDiv = false;
        if(srcElement.type != 'text' && srcElement.type != 'textarea'){ //
            return;
        }
    }

    if(event.keyCode === 32){
        // spacebar
        var words;
        if(isEditableDiv) {
            words = srcElement.innerHTML.split(' ');
        } else {
            words = srcElement.value.split(' ');
        }

        var lastWord = words[words.length - 1];

        var replacement = checkReplacement(lastWord);
        if(replacement){
            // we have a match
            if(isEditableDiv) {
                console.log(1)
                var location = srcElement.innerHTML.lastIndexOf(lastWord);
                backOut = srcElement.innerHTML;
                srcElement.innerHTML = srcElement.innerHTML.substring(0, location) + replacement;
                moveCursorToEnd(srcElement);
            } else {
                var location = srcElement.value.lastIndexOf(lastWord);
                backOut = srcElement.value;
                srcElement.value = srcElement.value.substring(0, location) + replacement;
            }
        }

    } else if(event.keyCode === 8 && backOut){
        // backspace... time to back it out
        event.preventDefault(); // we don't actually want that backspace getting through

        if(isEditableDiv) {
            srcElement.innerHTML = backOut + ' ';
            moveCursorToEnd(srcElement);
            backOut = null;
        } else {
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
