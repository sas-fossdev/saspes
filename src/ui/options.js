var analyticsid = "";

window.addEventListener("load", main, false);
function main() {
    browser.runtime.sendMessage({action: "analytics_send", args: {url: "saspes://options",action: "Options Page"}});

    browser.storage.local.get({analytics: true, percent_main_page : true, id : "Not set yet", save_grades_temp: true}).then(function(returned) {
        document.getElementById("analytics").checked = returned.analytics;
        document.getElementById("percent-mp").checked = returned.percent_main_page;
        document.getElementById("analytics-id").innerText = returned.id;
        document.getElementById("save-grades").checked = returned.save_grades_temp;
        analyticsid = returned.id;
    }, function(returned) {});
    document.getElementById("analytics").addEventListener("click", function() {
        let value = document.getElementById("analytics").checked;
        if(!value)  {
            browser.runtime.sendMessage({action: "analytics_send", args: {url: "saspes://disableanalytics.options", action: "Options Page: Disable Analytics", override: true}});
        }
        browser.storage.local.set({analytics: value});
    });
    document.getElementById("percent-mp").addEventListener("click", function() {
        let value = document.getElementById("percent-mp").checked;
        browser.storage.local.set({percent_main_page: value});
    });
    document.getElementById("save-grades").addEventListener("click", function() {
        let value = document.getElementById("save-grades").checked;
        browser.storage.local.set({save_grades_temp: value, previous_grades_temp: [], previous_person: ""});
    });
    document.getElementById("source-code-link").addEventListener("click", (event) => {
        let href = event.currentTarget.getAttribute('href');
        browser.runtime.sendMessage({action: "analytics_send", args: {url: href, extra: {link: href}}});
    })
    document.getElementById("website-link").addEventListener("click", (event) => {
        let href = event.currentTarget.getAttribute('href');
        browser.runtime.sendMessage({action: "analytics_send", args: {url: href, extra: {link: href}}});
    })
    document.getElementById("copy-analytics-id").addEventListener("click", function() {
        // let event = document.getElementById("copy-analytics-id");
        let event = this;
        if(event.getAttribute("attr-pressed"))    {
            return;
        }
        navigator.clipboard.writeText(analyticsid);
        event.innerText = "Copied!";
        event.setAttribute("attr-pressed","true");
        setTimeout(function()   {
            event.innerText = "Copy";
            event.removeAttribute("attr-pressed");
        },1500);
    });
}