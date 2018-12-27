let percent_main_page = true;
browser.storage.local.get({percent_main_page: true}).then(
    function( returned ) {
        percent_main_page = returned.percent_main_page;
    }, function() {}
);
$(document).ready(main);
function main( jQuery ) {
    
    // Button on options page
    let $topright = $('ul#tools');
    if($topright.length === 0)  {
        $('body').append(`<div style="position: absolute; top: 0px; right: 0px; margin-right: 8px;"><a id="extension-open">Extension Options </a> </div>`);
    } else {
        $topright.append(`<li><a id="extension-open">Extension Options</a> </li><span></span>`);
    }
    $('#extension-open').on('click', function() {
        browser.runtime.sendMessage({action: "open_settings"});
    });


    page_url = window.location.href;
    if(page_url == "https://powerschool.sas.edu.sg/guardian/homeHS.html")	{
        main_page();
        analytics_message("Main Page");
    } else if (page_url.match("https://powerschool.sas.edu.sg/guardian/scores") != null)	{
        class_page();
        analytics_message("Course Page");
    } else if(page_url == "https://powerschool.sas.edu.sg/guardian/home.html" || page_url == "https://powerschool.sas.edu.sg/public/" || page_url == "https://powerschool.sas.edu.sg/public/home.html")  {
        login_page();
        analytics_message("Login Page");
    } else {
        analytics_message("default");
    }
}
function analytics_message(action_input) {
    browser.runtime.sendMessage({action: "analytics_send", args: {url: window.location.href,action: action_input}});
}
function main_page()    {

    // Preperation for second semster:

    let student_name = $('#userName').find('span').eq(0).text();
    let second_semester = false;
    let grades = [];
    let course_names = [];
    let course_links = [];
    let percents = [];
    let possible_grades = ['A+','A','B+','B','C+','C','D+','D','F','exclude'];
    let $grade_rows = $('div#quickLookup table.grid').find('tr');
    if($grade_rows.eq(1).html().match("S2") != null) {
        second_semester = true;
    }
    for(let i = 0; i < $grade_rows.length; i++)  {
        let $course;
        if(second_semester) {
            $course = $grade_rows.eq(i).children('td').eq(3).find("a[href^='scores.html?']");
            let first_grade = $grade_rows.eq(i).children('td').eq(2).find(`a[href^='scores.html?']`);
            if(first_grade.length === 1)    {
                fill_percent(first_grade, `https://powerschool.sas.edu.sg/guardian/${first_grade.attr('href')}`, [0], 0)
            }
        } else {
            $course = $grade_rows.eq(i).children('td').eq(2).find("a[href^='scores.html?']");
        }
        if($course.length === 1) {
            let temp = $course.parents().eq(1).children("td[align=left]").text().match(".*(?=Details)")[0];
            course_names.push(temp.substring(0,temp.length - 1));
            grades.push($course.text());
            course_links.push($course.attr('href'));
            percents.push(-1);
            fill_percent($course, "https://powerschool.sas.edu.sg/guardian/" + $course.attr('href'), percents, percents.length - 1);
        }
        
    }
    let num_courses = grades.length;

    $("table[border='0'][cellpadding='3'][cellspacing='1'][width='100%']").prepend(`<tr><td align=\"center\">Current Semester GPA (${second_semester?'S2':'S1'}): ${calculate_gpa(course_names,grades)}</td></tr>`);

    // Hypo Grade Calculator
    let hypo_grade_div = `<div class='hypo-grade-div-fixed'><div class="hypo-grade-div"><div class="hypo-grade-open"><div class="arrow arrow-left" id="hypo-arrow"></div></div></div></div>`;
    let hypo_grade_panel = `<div class="hypo-grade-panel"><table id="hypo-table"><br />`;
    for(let o = 0; o < num_courses; o++) {
        hypo_grade_panel += `<tr><td><a href="${course_links[o]}" target="_blank">${course_names[o]}</a>:</td><td><select class="hypo-grade-select" id="${o}">`;
        let found = false;
        for(let i = 0; i < possible_grades.length; i++) {
            let temp = false;
            if((!found && grades[o] === possible_grades[i]) || (!found && i === possible_grades.length - 1))  {
                temp = true;
                found = true;
            }
            hypo_grade_panel += `<option value="${possible_grades[i]}" ${(temp)? 'selected': ''}>${possible_grades[i]}</option>`;
        }
        hypo_grade_panel += `</select></td></tr>`;
    }
    let currently_open = false;
    let hypo_grades = grades.slice();
    hypo_grade_panel += `</table><br /><h3>With the above grades, semester GPA would be: <text id="number">${calculate_gpa(course_names,hypo_grades)}</text>.</h3></div>`;
    $(hypo_grade_div).appendTo('body');
    let hypo_grade_div_dom = $('div.hypo-grade-div');
    let hypo_grade_panel_dom = $(hypo_grade_panel).appendTo(hypo_grade_div_dom);
    let hypo_grade_panel_dom_width = hypo_grade_panel_dom.width() + 1;
    let hypo_grade_open_dom = $('div.hypo-grade-open');
    hypo_grade_div_dom.css('left',hypo_grade_panel_dom_width);
    $('.hypo-grade-select').on('change', function( event )  {
        hypo_grades[$(event.currentTarget).attr('id')] = this.value;
        $('text#number').html(calculate_gpa(course_names,hypo_grades));
    });

    hypo_grade_open_dom.on('click', function(event) {
        if(currently_open)  {
            let hypo_grade_panel_dom = $('div.hypo-grade-panel');

            hypo_grade_div_dom.css('left', hypo_grade_panel_dom_width);
            hypo_grade_panel_dom.replaceWith(hypo_grade_panel);
            hypo_grades = grades.slice();
            $('.hypo-grade-select').on('change', function( event )  {
                hypo_grades[$(event.currentTarget).attr('id')] = this.value;
                $('text#number').html(calculate_gpa(course_names,hypo_grades));
            });
            $('div#hypo-arrow').removeClass('arrow-right').addClass('arrow-left');
            currently_open = false;
        } else {
            hypo_grade_div_dom.css('left', '0');
            $('div#hypo-arrow').removeClass('arrow-left').addClass('arrow-right');
            currently_open = true;
        }
    });

    // Temporary code for saving last seen grades.
    window.addEventListener('beforeunload', (e) =>   {
        browser.storage.local.get({previous_grades_temp: [], previous_person: ""}).then((returned) => {
            let temp = returned.previous_grades_temp;
            if(returned.previous_person.length === 0 || returned.previous_person != student_name)   {
                browser.storage.local.set({previous_person: student_name});
                returned.previous_person = student_name;
                temp = [];
            }
            for(let i = 0; i < percents.length; i++)    {
                let course_object = {
                    name: course_names[i],
                    grade: grades[i],
                    fp: percents[i]
                }
                let found = false;
                for(let c = 0; c < temp.length; c++)    {
                    if(temp[c].name === course_object.name) {
                        found = true;
                        if(course_object.fp != -1)    {
                            temp[c] = course_object;
                        }
                        break;
                    }
                }
                if(!found)  {
                    temp.push(course_object);
                }
                
            }
            browser.storage.local.set({previous_grades_temp: temp})
        })
    });
}
function class_page()	{
    let regex = /(?=document\.write).*/g
    let current_string = $("table.linkDescList").html();
    regex.exec(current_string);
    current_string = regex.exec(current_string)[0];
    regex = /[0-9]*\.[0-9]*/g
    let temp = current_string.match(regex);
    let number = temp[temp.length - 1];
    //let number = $("table.linkDescList").html().match("(?=;\.;).*(?=])")[0].substring(3);
    if(isNaN(number))   {
        return;
    }
    $("table.linkDescList:first").append(`<tr><td><strong>Final Percent: </strong></td><td>` + parseFloat(number).toFixed(2) + ` <div class="tooltip saspe">&#9432;<span class="tooltiptext saspe">85: A+ | 75: A <br />65: B+ | 55: B <br />45: C+ | 35: C <br/>25: D+ | 15: D</span></div></td></tr>`);
}
function login_page()   {
    browser.storage.local.get({save_grades_temp: true}).then((r) => {
        if(r.save_grades_temp)  {
            let link = "";
            if(typeof chromium !== 'undefined')    {
                link = browser.extension.getURL("/chromium/ui/historygrades.html");
            } else {
                link = browser.extension.getURL("/ui/historygrades.html");
            }
            $('<a></a>').attr("id", "historygradesopen").text("View Last Seen Grades (Experimental Feature) (Disable from Extension Options)").appendTo('#sign-in-content').on('click', (e) => {
                window.open(link);
            });
        }
    })
}
function fill_percent($fill_location,url_link,percents, pos_in_arr)    {
    if(!percent_main_page)  {
        return;
    }
    $.ajax({
        url: url_link
    }).done(function(data) {
        let regex = /(?=document\.write).*/g
        let current_string = data;
        regex.exec(current_string);
        current_string = regex.exec(current_string)[0];
        regex = /[0-9]*\.[0-9]*/g
        let temp = current_string.match(regex);
        let final_percent = temp[temp.length - 1];
        if(isNaN(final_percent))    {
            percents[pos_in_arr] = -1;
            return;
        }
        $fill_location.append(` (${parseFloat(final_percent).toFixed(2)})`);
        percents[pos_in_arr] = parseFloat(final_percent).toFixed(2);
    }).fail(function()  {
        percents[pos_in_arr] = -1;
        console.log(`Ajax failed! Error on accessing: ${url_link}.`);
    });
}
function calculate_gpa(course_names, grades)    {
    let courses_with_grades = 0;
    let sum = 0;
    for(var i = 0; i < grades.length; i++)  {
        if(grade_gpa(grades[i]) != -1)  {
            let multiplier = total_add(course_names[i]);
            courses_with_grades += multiplier;
            sum += multiplier * (grade_gpa(grades[i]) + course_boost(course_names[i], grades[i]));
        }
    }
    if(courses_with_grades === 0) {
        return '0.00';
    }
    return (Math.round((sum/courses_with_grades) * 100)/100).toFixed(2);
    function total_add(course_name) {
        let double_effect_courses = [`English 10/American History`,`English 9/World History`]
        if(double_effect_courses.indexOf(course_name) != -1)     {
            return 2;
        }
        if(/^(I Service: |IS: )/.test(course_name))   {
            return 0.5;
        }
        return 1;
    }
}

function course_boost(course_name, grade)  {
    if(grade_gpa(grade) < 1.8)  {
        return 0;
    }
    if(/^(AP | AT )/.test(course_name) )    {
        if(course_name.substring(course_name.length - 1) === '.')   {
            return 0.25;
        }
        return 0.5;
    }
    return 0;
}
function grade_gpa(grade)    {
    switch(grade){
        case "A+":
            return 4.5;
            break;
        case "A":
            return 4.0;
            break;
        case "B+":
            return 3.5;
            break;
        case "B":
            return 3.0;
            break;
        case "C+":
            return 2.5;
            break;
        case "C":
            return 2.0;
            break;
        case "D+":
            return 1.5;
            break;
        case "D":
            return 1.0;
            break;
        case "F":
            return 0.0;
            break;
        default:
            return -1;
            break;
    }
}
