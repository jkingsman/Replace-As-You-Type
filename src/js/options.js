var ruleSet;

function listRules() {
    $("#rules").empty();
    chrome.storage.sync.get('rules', function(data) {
        if (typeof data.rules === 'undefined') {
            chrome.storage.sync.set({
                'rules': []
            });

            ruleSet = [];
        } else {
            ruleSet = data.rules;
        }

        //print out current rules
        for (var i = 0; i < ruleSet.length; i++) {
            var rule = ruleSet[i];
            $("#rules").append('<li>' + rule.searchString + ' &rarr; ' + rule.replaceString + ' <a href="#" class="deleteButton" id="del-' + rule.key + '"><i class="glyphicon glyphicon-trash"></i></a></li>');
        }

        //attach delete function listener
        $('.deleteButton').click(function() {
            for (var i = 0; i < ruleSet.length; i++) {
                //this is somewhat unnecessary; we could just go by array key but it keeps us resilient if they have two tabs open
                var rule = ruleSet[i];
                if ($(this).attr('id').replace(/\D/g, '') == rule.key) {
                    ruleSet.splice(i, 1);
                    chrome.storage.sync.set({
                        "rules": ruleSet
                    });
                    $(this).parent().remove();
                }
            }

            chrome.storage.sync.set({
                "rules": ruleSet
            });
            listRules();
        });
    });
}

//handle rule addition
$("#addRule").submit(function(e) {
    e.preventDefault();

    ruleSet.push({
        "key": Math.floor((Math.random() * 99999) + 10000),
        "searchString": $("#search").val(),
        "replaceString": $("#replace").val()
    });

    chrome.storage.sync.set({
        'rules': ruleSet
    });

    listRules();
    $("#search").val("");
    $("#replace").val("");
});

document.addEventListener('DOMContentLoaded', listRules);
