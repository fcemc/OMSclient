var tryingToReconnect = false, user;
var memberData = [], outageInfo;

$(document).ready(function () {
    //adjust for status bar in iOS
    if (/iPad|iPod|iPhone/i.test(navigator.userAgent)) {
        $("body").css("background-color", "black");
        $("div[role='dialog']").css("background-color", "#efecec");
        $(".pg").css({ "margin-top": "20px" });
    }

    if (navigator.onLine) {
        checkCookie();
        getSpinner();
        $("#spinCont").hide();
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "0",
            "hideDuration": "0",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
    }
    else {
        var r = confirm("No network connection detected, check setting and try again!");
        if (r == true) {
            window.location.reload();
        }
        else {
            $.mobile.pageContainer.pagecontainer("change", "#pageLogin");
        }
    }
});

//region Login&Cookies
function getAccount() {
    var v = $("#memberNumber").val();
    var paramItems = "MBRNO|" + v;
    $.ajax({
        type: "GET",
        url: "http://gis.fourcty.org/FCEMCrest/FCEMCDataService.svc/MEMBERLIST/" + paramItems,
        contentType: "application/json; charset=utf-8",
        cache: false,
        beforeSend: function () {
            $("#spinCont").show();
        },
        success: function (result) {
            if (result.MEMBERLISTResult.length == 0) {
                $("#memberNumber").val("");
                alert("There is an issue with you account, unalbe to add account. Please contact Four County EMC for assistance");
            }
            else if (result.MEMBERLISTResult.length > 0) {
                memberData = [];
                var results = result.MEMBERLISTResult;
                for (var i = 0; i < results.length; i++) {
                    memberData.push({ NAME: results[i].NAME, MEMBERNO: results[i].MEMBERNO, MEMBERSEP: results[i].MEMBERSEP, BILLADDR: results[i].BILLADDR, SERVADDR: results[i].SERVADDR, PHONE: results[i].PHONE, MAPNUMBER: results[i].MAPNUMBER, METER: results[i].METER });
                }
                localStorage.setItem("fcemcMemberData", JSON.stringify(memberData));
                listAccounts();
            }
        },
        complete: function () {
            $("#spinCont").hide();
        },
        error: function (textStatus, errorThrown) {
            var txt = textStatus;
            var et = errorThrown;
        }
    });
}

function setCookie(account, name, cnumber) {
    window.localStorage.clear();
    localStorage.setItem("fcemcMemberData", memberData);
}

function getCookie() {
    var bakedCookies = false;
    if (localStorage.fcemcMemberData !== undefined) {
        bakedCookies = true;
    }
    return bakedCookies;
}

function checkCookie() {
    var valid = getCookie();
    if (valid == true) {
        listAccounts();
    }
    else {
        $.mobile.pageContainer.pagecontainer("change", "#page2");
    }
}
//endregion

function listAccounts() {
    var data = JSON.parse(localStorage.getItem("fcemcMemberData"));

    if (data.length == 1) {
        var _string = '<div class="accdEntry"><b>Member Name:</b> ' + data[0].NAME + '</div>';
        _string += '<div class="accdEntry"><b>Member Number:</b> ' + data[0].MEMBERNO + '</div>';
        _string += '<div class="accdEntry"><b>Member SEP:</b> ' + data[0].MEMBERSEP + '</div>';
        _string += '<div class="accdEntry"><b>Meter Number:</b> ' + data[0].METER + '</div>';
        _string += '<div class="accdEntry"><b>Site Address :</b> ' + data[0].SERVADDR + '</div>';
        _string += '<div class="accdEntry"><b>Map Number:</b> ' + data[0].MAPNUMBER + '</div>';
        _string += '<div class="accdEntry"><b>Phone Number:</b> ' + data[0].PHONE + '</div>';

        _string += '<div><button id="btn_' + data[0].MEMBERSEP + '" style="background-color:red;" onclick="reportmOtage(\'' + data[0].MEMBERSEP + ',' + data[0].METER + ',' + data[0].PHONE + ',' + data[0].MAPNUMBER + ',' + 'Send from OMS outage app Power Out\');" class="ui-btn ui-corner-all">Report Outage</button></div>';

        $("#accnts").html("");
        $("#accnts").html(_string.toString());
    }
    else if (data.length > 1) {
        var _string = "<div data-role='collapsible-set'>";
        for (i = 0; i < data.length; i++) {

            if (data[i].SERVADDR != null) {
                _string += "<div data-role='collapsible'><h3>" + data[i].SERVADDR + "</h3>";
            }
            else {
                _string += "<div data-role='collapsible'><h3>" + data[i].MEMBERSEP + "</h3>";
            }

            _string += "<div class='accdEntry'><b>Member Name:</b> " + data[i].NAME + "</div>";
            _string += "<div class='accdEntry'><b>Member Number:</b> " + data[i].MEMBERNO + "</div>";
            _string += "<div class='accdEntry'><b>Member SEP:</b> " + data[i].MEMBERSEP + "</div>";
            _string += "<div class='accdEntry'><b>Meter Number:</b> " + data[i].METER + "</div>";
            _string += "<div class='accdEntry'><b>Site Address :</b> " + data[i].SERVADDR + "</div>";
            _string += "<div class='accdEntry'><b>Map Number:</b> " + data[i].MAPNUMBER + "</div>";
            _string += "<div class='accdEntry'><b>Phone Number:</b> " + data[i].PHONE + "</div>";
            _string += '<div><button id="btn_' + data[i].MEMBERSEP + '" style="background-color:red;" onclick="reportmOtage(\'' + data[i].MEMBERSEP + ',' + data[i].METER + ',' + data[i].PHONE + ',' + data[i].MAPNUMBER + ',' + 'Send from OMS outage app Power Out\');" class="ui-btn ui-corner-all">Report Outage</button></div>';
            _string += "</div>";
        }
        _string += "</div>";

        $("#accnts").html("");
        $("#accnts").html(_string.toString());
        $('#accnts [data-role=collapsible-set]').collapsibleset();
    }
    else if (data.length == 0) {
        $("#accnts").html("");
        $("#accnts").html("No Accounts Avalible");
    }

    $.mobile.pageContainer.pagecontainer("change", "#page1");
    $("#spinCont").hide();


    checkInOutage();
}

function checkInOutage() {
    $.ajax({
        type: "GET",
        async: false,
        cache: false,
        dataType: "json",
        url: "http://gis.fourcty.org/FCEMCrest/FCEMCDataService.svc/getOUTAGEACCOUNTS",
        success: function (results) {
            var r = results.getOUTAGEACCOUNTSResult;
            if (r.length > 0) {
                var data = JSON.parse(localStorage.getItem("fcemcMemberData"));
                for (i = 0; i < data.length; i++) {
                    if (jQuery.inArray(data[i].MEMBERSEP, r) > -1) {
                        $('#btn_' + data[i].MEMBERSEP).text("Account in Current Outage")
                        $('#btn_' + data[i].MEMBERSEP).prop('disabled', true).addClass('ui-disabled');

                    }
                }
            }
        }
    });
}

function reportmOtage(info) {
    $("#spinCont").show();
    outageInfo = "";
    outageInfo = info;
    var button;
    navigator.notification.confirm("Are you sure you want to report an outage at this location?", ouatageSumissionCallBack, "Please Confirm:", "Cancel, Ok");
}

function ouatageSumissionCallBack(button) {
    if (button == 2) {
        var info = outageInfo;
        var account = info.split(",")[0];
        var meter = info.split(",")[1];
        var phone = info.split(",")[2];
        var grid = info.split(",")[3];
        var cmnts = info.split(",")[4];

        if (phone == "") {
            phone = "blank";
        }
        if (account == "") {
            account = "blank";
        }
        if (grid == "") {
            grid = "blank";
        }
        if (meter == "") {
            meter = "blank";
        }
        if (cmnts == "") {
            cmnts = "blank";
        }
        else if (cmnts.indexOf("/") >= 0) {
            cmnts = cmnts.replace(/\//g, "~");
        }

        var details = account + "/" + meter + "/" + phone + "/" + grid + "/" + cmnts;

        $.ajax({
            type: "GET",
            async: false,
            cache: false,
            dataType: "json",
            url: "http://gis.fourcty.org/FCEMCrest/FCEMCDataService.svc/REPORTOUTAGE/" + details,
            success: function (results) {
                if (results.REPORTOUTAGEResult == true) {
                    $('#btn_' + account).text("Account in Current Outage")
                    $('#btn_' + account).prop('disabled', true).addClass('ui-disabled');
                    navigator.notification.alert("Outage has been reported!", "", "Success:", "Ok");                    
                    $("#spinCont").hide();
                }
                else {
                    $('#btn_' + account).text("Account in Current Outage")
                    $('#btn_' + account).prop('disabled', true).addClass('ui-disabled');
                    navigator.notification.alert("Account already in an existing outage", "", "", "Ok");
                    $("#spinCont").hide();
                }
            }
        });
    }
    else if (button == 1) {
        cancelOtage();
        $("#spinCont").hide();
    }        
}



function getSpinner() {
    var opts = {
        lines: 12             // The number of lines to draw
        , length: 7             // The length of each line
        , width: 5              // The line thickness
        , radius: 10            // The radius of the inner circle
        , scale: 1.0            // Scales overall size of the spinner
        , corners: 1            // Roundness (0..1)
        , color: '#000'         // #rgb or #rrggbb
        , opacity: 1 / 4          // Opacity of the lines
        , rotate: 0             // Rotation offset
        , direction: 1          // 1: clockwise, -1: counterclockwise
        , speed: 1              // Rounds per second
        , trail: 100            // Afterglow percentage
        , fps: 20               // Frames per second when using setTimeout()
        , zIndex: 2e9           // Use a high z-index by default
        , className: 'spinner'  // CSS class to assign to the element
        , top: '50%'            // center vertically
        , left: '50%'           // center horizontally
        , shadow: false         // Whether to render a shadow
        , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
        , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('spinwheel');
    spinner = new Spinner(opts).spin(target);
}

function cancelOtage() {    
    $.mobile.pageContainer.pagecontainer("change", "#page1");
}

function clearAccount() {
    if(confirm("Delete current account?")){
        localStorage.clear();
        $("#memberNumber").val("");
        $.mobile.pageContainer.pagecontainer("change", "#page2");
    }
}