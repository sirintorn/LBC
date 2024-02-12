var sendtype = "";
var newsdata = "";

var restws = "http://172.16.53.1:8080/API_SERVICE-II/";
//var restws = "http://192.168.2.10:8080/API_SERVICE/";
//var restws = "http://192.168.2.10:8080/API_SERVICE/";

function addKaizen(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addKaizen",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function gsdDetailByCdt(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/gsdDetailByCdt",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGsdDataByCdn(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdDataByCdn",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function addGsdHeader(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addGsdHeader",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getFactory(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getFactory",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getGsdHeaderAll(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdHeaderAll ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getLineBuilFac(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getLineBuilFac  ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGsdHeader(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdHeader ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getGsdHeaderByCust(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdHeaderByCust ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function addLbMain(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addLbMain ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getLbMainByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getLbMainByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getGsdHeaderByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdHeaderByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getMaxSeqLbD(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getMaxSeqLbD ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function addLbDetails(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addLbDetails ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function upOldLbDAddNewLbD(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/upOldLbDAddNewLbD ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function updateLbMainData(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/updateLbMainData ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getCrdateFrLbMainByMax(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getCrdateFrLbMainByMax ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getLinebalanceView(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getLinebalanceView ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGsdDetailByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdDetailByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function updateLbDetailByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/updateLbDetailByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function updateLbMainByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/updateLbMainByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function updateLbMainByCdtTaktTime(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/updateLbMainByCdtTaktTime ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getWorkgroup(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getWorkgroup ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getWorkgroupGcodeFilter(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getWorkgroupGcodeFilter ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function addWorkgroup(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addWorkgroup ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function deleteLbDetail(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/deleteLbDetail ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getWorkgroupFilter(request, fn, fnerror) {
    console.log('server', restws);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getWorkgroupFilter ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

//***********************GSD ANALYSIS****************************\

function deleteLbDetail(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/deleteLbDetail ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGaMainData(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGaMainData ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGsdDetailsToGroup(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdDetailsToGroup ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function addGaDetails(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addGaDetails ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function updateGaDetails(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/updateGaDetails ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function deleteGaDetail(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/deleteGaDetail ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

//**************************************LOGIN SERVICE*******************************************

function getLoginData(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getLoginData ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}


function getPdtPlan(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getPdtPlan ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getCustomerByCode(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getCustomerByCode ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGcode(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGcode ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function addGcode(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addGcode ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function getGaMainByCdt(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGaMainByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}
function addGaMain(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addGaMain ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getGaDetail(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGaDetail ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getLbMainById(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getLbMainByCdt ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}


function getGsdDetailStepOnly(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getGsdDetailStepOnly ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getMaxSeqKaizen(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getMaxSeqKaizen ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getKaizen(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getKaizen ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getSewingStandard(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getSewingStandard ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getMaxStationId(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getMaxStationId ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function getMedianData(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getMedianData ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function addLbDetailMedian(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/addLbDetailMedian ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}

function deleteLbMain4Median(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/deleteLbMain4Median ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}


function getRevision(request, fn, fnerror) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: restws + "service/getRevision ",
        data: request,
        beforeSend: function () {

        },
        success: fn,
        error: fnerror
    });
}