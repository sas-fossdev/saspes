/*
    SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.

    Copyright (C) 2018-2019 Gary Kim <gary@garykim.dev>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
    
*/

'use strict';

const fprange = {
    '0-15': 'F',
    '15-25': 'D',
    '25-35': 'D+',
    '35-45': 'C',
    '45-55': 'C+',
    '55-65': 'B',
    '65-75': 'B+',
    '75-85': 'A',
    '85-90': 'A+'
}

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


    let page_url = window.location.href.split('#')[0];
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
    let student_name = document.querySelector('#userName').querySelector('span').innerText;
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
                if(grade_gpa(first_grade.text()) !== -1 )   {
                    fill_percent(first_grade, `https://powerschool.sas.edu.sg/guardian/${first_grade.attr('href')}`, [0], 0);
                }
            }
        } else {
            $course = $grade_rows.eq(i).children('td').eq(2).find("a[href^='scores.html?']");
        }
        if($course.length === 1) {
            let temp = $course.parents().eq(1).children("td[align=left]").text().match(".*(?=Details)")[0];
            course_names.push(temp.trim());
            grades.push($course.text());
            course_links.push($course.attr('href'));
            percents.push(-1);
            if(grade_gpa($course.text()) !== -1 )  {
                fill_percent($course, "https://powerschool.sas.edu.sg/guardian/" + $course.attr('href'), percents, percents.length - 1);
            }
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
    hypo_grade_panel += `</table><br /><h3>With the above grades, semester GPA would be: <text id="hypo-gpa-number">${calculate_gpa(course_names,hypo_grades)}</text>.</h3></div>`;
    $(hypo_grade_div).appendTo('body');
    let hypo_grade_div_dom = $('div.hypo-grade-div');
    let hypo_grade_panel_dom = $(hypo_grade_panel).appendTo(hypo_grade_div_dom);
    let hypo_grade_panel_dom_width = hypo_grade_panel_dom.width() + 1;
    let hypo_grade_open_dom = $('div.hypo-grade-open');
    hypo_grade_div_dom.css('left',hypo_grade_panel_dom_width);
    $('.hypo-grade-select').on('change', function( event )  {
        hypo_grades[$(event.currentTarget).attr('id')] = this.value;
        $('#hypo-gpa-number').html(calculate_gpa(course_names,hypo_grades));
    });

    hypo_grade_open_dom.on('click', function(event) {
        if(currently_open)  {
            let hypo_grade_panel_dom = $('div.hypo-grade-panel');

            hypo_grade_div_dom.css('left', hypo_grade_panel_dom_width);
            hypo_grade_panel_dom.replaceWith(hypo_grade_panel);
            hypo_grades = grades.slice();
            $('.hypo-grade-select').on('change', function( event )  {
                hypo_grades[$(event.currentTarget).attr('id')] = this.value;
                $('#hypo-gpa-number').html(calculate_gpa(course_names,hypo_grades));
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
    /*
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
    */
}
function class_page()	{

    // Show final percent
    let current_string = $("table.linkDescList").html();
    current_string = current_string.match(/(?=document\.write).*/g)[1];
    current_string = /\[.*\]/g.exec(current_string)[0].slice(1,-1);
    let temp = current_string.split(";");
    let number = Math.max(isNaN(temp[temp.length-2])?-Infinity:parseFloat(temp[temp.length-2]),isNaN(temp[temp.length-1])?-Infinity:parseFloat(temp[temp.length-1]));
    //let number = $("table.linkDescList").html().match("(?=;\.;).*(?=])")[0].substring(3);
    if(number === -Infinity)   {
        return;
    }
    document.querySelector("table.linkDescList").append(html2node(`<tr><td><strong>Final Percent: </strong></td><td>` + parseFloat(number).toFixed(2) + ` <div class="tooltip saspe">&#9432;<span class="tooltiptext saspe">85: A+ | 75: A <br />65: B+ | 55: B <br />45: C+ | 35: C <br/>25: D+ | 15: D</span></div></td></tr>`));


    // Hypo Assignment
    let $hypo_assignment = $('<div></div>').addClass('saspes-section');
    let hypo_assignment_info = {
        weight: 0,
        grade: 'B'
    };

    $hypo_assignment.html('<h3>Hypothetical Assignment</h3> <label for="saspes-assignment-effect" >Effect of new assignment (currently): </label>');
    

    $('<input type="number" min="0" max="100" value="0" id="saspes-assignment-effect" />').on('input', (e) => {
        hypo_assignment_info.weight = getInRange(parseInt(e.currentTarget.value), 0, 100);
        showHypoGrade();
    }).appendTo($hypo_assignment);
    $hypo_assignment.append($('<text>% </text>'))
    $hypo_assignment.append($('<label for="hypo-grade-select">Grade of new assignment: </label>'));
    $('<select id="hypo-grade-select"><option value="A+">A+</option><option value="A">A</option><option value="B+">B+</option><option value="B" selected="">B</option><option value="C+">C+</option><option value="C">C</option><option value="D+">D+</option><option value="D">D</option><option value="F">F</option></select>').on('change', (e) => {
        hypo_assignment_info.grade = e.currentTarget.value;
        showHypoGrade();
    }).appendTo($hypo_assignment);
    $hypo_assignment.append(`<br /><h4>Your grade with the selected assignment would be <text id="new-hypo-grade"></text> with a final percent of <text id="new-hypo-fp"></text>.</h4>`);

    $hypo_assignment.insertAfter('div.box-round');

    showHypoGrade();
    function showHypoGrade() {
        let new_fp = hypo_assignment_info.weight * 0.01 * grade_fp(hypo_assignment_info.grade) + ((100 - (hypo_assignment_info.weight)) * 0.01 * parseFloat(number));
        console.log(new_fp);
        console.log(getKeyRange(fprange, new_fp))
        document.querySelector('div.saspes-section text#new-hypo-grade').innerText = getKeyRange(fprange, new_fp);
        document.querySelector('div.saspes-section text#new-hypo-fp').innerText = new_fp.toFixed(2);
    }

    
}
function login_page()   {
    /*
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
    */

    //document.getElementById('sign-in-content').append(document.createTextNode("Last Seen Grades has been temporarily removed to be improved upon."))
    
    /*
    let insert_location = document.querySelector('#content');
    insert_location.parentNode.insertBefore(document.createElement('a'), insert_location);
    */
    $('<div id="saspes-info"></div>').insertAfter('div#content');
    $('#saspes-info').html(`<h3> <img src="${browser.runtime.getURL('icons/128.png')}" class="saspes-logo">SAS Powerschool Enhancement Suite</h3> <div class="saspes-content"><p style="font-size: 1.5em;">Version: ${browser.runtime.getManifest().version}</p><p><a class="saspes-link" href="https://gschool.ydgkim.com/saspowerschool/" target="_blank" >Project Website<a> | <a href="https://github.com/gary-kim/saspes/blob/master/CHANGELOG.md" class="saspes-link" target="_blank" >Changelog</a> | <a class="saspes-link" href="https://github.com/gary-kim/saspes" target="_blank" >Source Code</a> | <a id="login-extension-settings" href="#" >Extension Options</a></div></p>`);
    $('#login-extension-settings').on('click', () => {
        browser.runtime.sendMessage({action: "open_settings"});
    });
    $('.saspes-link').on('click', (e) => {
        let href = e.currentTarget.href;
        browser.runtime.sendMessage({action: "analytics_send", args: {url: href, extra: {link: href}}});
    });
        
}
function fill_percent($fill_location,url_link,percents, pos_in_arr)    {
    if(!percent_main_page)  {
        return;
    }
    $.ajax({
        url: url_link
    }).done(function(data) {
        let current_string = data;
        current_string = current_string.match(/(?=document\.write).*/g)[1];
        current_string = /\[.*\]/g.exec(current_string)[0].slice(1,-1);
        let temp = current_string.split(";");
        let final_percent = Math.max(isNaN(temp[temp.length-2])?-Infinity:parseFloat(temp[temp.length-2]),isNaN(temp[temp.length-1])?-Infinity:parseFloat(temp[temp.length-1]));
        if(final_percent === -Infinity)    {
            percents[pos_in_arr] = -1;
            return;
        }
        $fill_location.append(` (${final_percent.toFixed(2)})`);
        percents[pos_in_arr] = final_percent.toFixed(2);
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
    if(/^(AP |AT )/.test(course_name) )    {
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
function grade_fp(grade) {
    switch(grade){
        case "A+":
            return 90;
            break;
        case "A":
            return 80;
            break;
        case "B+":
            return 70;
            break;
        case "B":
            return 60;
            break;
        case "C+":
            return 50;
            break;
        case "C":
            return 40;
            break;
        case "D+":
            return 30;
            break;
        case "D":
            return 20;
            break;
        case "F":
            return 10;
            break;
        default:
            return -1;
            break;
    }
}
function html2node(html_string) {
    return html2nodelist(html_string)[0];
}
function html2nodelist(html_string)  {
    let temp = document.createElement('template');
    temp.innerHTML = html_string;
    return temp.content.childNodes;
}