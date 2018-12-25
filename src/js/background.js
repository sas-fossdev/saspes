// Analytics
var analytics = new Object();
var version = browser.runtime.getManifest().version;
browser.storage.local.get({analytics: true,id : ""}).then(function(returned) {
    analytics.enabled = returned.analytics; 
    analytics.id = returned.id;
    if(analytics.id.length === 0)   {
        reset_analytics();
    }
}, function(returned) {});

// Listen for requests from tabs
browser.runtime.onMessage.addListener(message_recieve);
function message_recieve(message) {
    switch(message.action)	{
        case "analytics_send":
            analytics_send(message.args);
            // Requires an args attribute. Args should be an object that must have a 'url' attribute and can have a string called 'action' and a object called 'extra'.
            break;
        case "open_settings":
            browser.runtime.openOptionsPage();
            break;
        case "reset_analytics":
            reset_analytics();
            break;
        default:
            break;
    }
}
function analytics_send(arg)	{
    browser.storage.local.get({analytics: true, percent_main_page : true, save_grades_temp: true}).then(function(returned) {
        analytics.enabled = returned.analytics
        if(analytics.enabled)   {
            let cvar_json = JSON.stringify({"1":["version", version], "2": ["FP", returned.percent_main_page.toString()], "3":["Save Grades Temp", returned.save_grades_temp.toString()]});
            let send_info = {
                'idsite': '4',
                'rec': '1',
                'url': arg.url,
                '_id': analytics.id,
                'apiv': '1',
                'cid': analytics.id,
                '_cvar': cvar_json
            };
            if(typeof arg.action !== 'undefined')   {
                send_info['action_name'] = arg.action;
            }
            if(typeof arg.extra === 'object')   {
                let extra_entries = Object.entries(arg.extra);
                for(let i = 0; i < extra_entries.length; i++)   {
                    send_info[extra_entries[i][0]] = extra_entries[i][1];
                }
            }
            $.ajax({
                url: "https://analytics.ydgkim.com/piwik.php",
                type: "get",
                data: send_info
            });
        }
    }, function(returned) {});
    
}
function reset_analytics()    {
    analytics.id = randomString(16,'1234567890abcdef');
    browser.storage.local.set({id: analytics.id});
}

// Helpers
// Copied from Nimphious's answer on Stack Overflow
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}