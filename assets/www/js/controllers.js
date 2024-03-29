﻿angular.module('starter.controllers', ['ionic'])


        .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $state) {
            $scope.logout = function () {
                $state.go('login');
            };
        })
        .controller('LoginCtrl', function ($scope, $ionicPopup, $stateParams, $ionicModal, $state, $ionicLoading) {
            $scope.$on('$ionicView.enter', function () {
//                alert('init login');
                localStorage.setItem("login_factory_id", null);
                $scope.cdt = {};
                $scope.getFactory();
                var deviceInformation = ionic.Platform.device();
                $scope.cdt.device_sn = deviceInformation.serial;
//               var deviceInformation = ionic.Platform;
//                alert(deviceInformation);
                console.log('deviceInformation', deviceInformation);
            });
            $scope.getFactory = function () {
                showLoading($ionicLoading);
                var request = {request: ''};
                getFactory(request, function (data) {
                    console.log("getFactory", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.factory_obj = data.data;
                    } else {
                        $scope.cdt.factory_obj = {};
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getFactory", "ERROR");
                    hideLoading($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning Login Data',
                        template: "No internet signal"
                    });
                    alertPopup.then(function (res) {
                    });

                });
            }
            $scope.doLogin = function () {
                showLoading($ionicLoading);
                if (validateLogin()) {
                    var request = {username: $scope.cdt.username, password: $scope.cdt.password, device_sn: $scope.cdt.device_sn};
                    getLoginData(request, function (data) {
                        console.log("getLoginData", data);
                        if (data.errorcode == "OK") {
                            localStorage.setItem("login_factory_data", JSON.stringify($scope.cdt.factory_data));

                            hideLoading($ionicLoading);
                            $scope.cdt.login = data.data;

                            localStorage.setItem("login_user_id", JSON.stringify($scope.cdt.login.id));
                            $state.go('app.new_install');
                        } else {
                            hideLoading($ionicLoading);
                            var alertPopup = $ionicPopup.alert({
                                title: 'Warning Login Data',
                                template: "Please " + "<span style='color:#cc3300'>" + data.errormsg + "</span>"
                            });
                            alertPopup.then(function (res) {
                            });
                        }

                    }, function () {
                        console.log("getLoginData", "ERROR");
                        hideLoading($ionicLoading);

                    });
                }
            };
            function validateLogin() {
                var msg = "";
                if (!$scope.cdt.username) {
                    msg += (msg == "" ? "" : ",") + "Username";
                }
                if (!$scope.cdt.password) {
                    msg += (msg == "" ? "" : ",") + "Password";
                }
                if (!$scope.cdt.factory_data) {
                    msg += (msg == "" ? "" : ",") + "Location";
                }
                if (msg != "") {
                    $ionicPopup.alert({
                        title: 'Warning Login Data',
                        template: "Please " + "<span style='color:#cc3300'>" + msg + "</span>"
                    });
                    hideLoading($ionicLoading);
                    return false;
                } else {
                    return true;
                }
            }
        })
        .controller('NewInstall', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading, $cordovaPrinter) {
            //Start Paramitor Timer Cycle Time
            var flag_stop = false;
            var interval_time;
            var sum_time = 0.000;
            //End Paramitor Timer Cycle Time
            //Start Paramitor Timer Data Grid
            var flag_timer = false;
            var interval_data_grid;
//            End Paramitor Timer Data Grid
            var factory_data = null;
            var user_id = null;
            var a = 0.0;
            var na = 0.0;
            var b = 0.0;
            var nb = 0.0;
            var c = 0.0;
            var nc = 0.0;
            var lineBalancceViewID = 0;
            var cdt_std_data;
            var wip = 5;

            var startDateTime = "";
            var finishDateTime = "";
            var max_rev = 0;

            var isUnderTakt = false;
            var tableColor = "9999ff";

            clearGraph();

            function init() {
            }
            $scope.$on('$ionicView.enter', function () {
                $scope.cdt = {};
                $scope.cdt_dl_style = {};
                $scope.cdt_dl_gsd = {};

                $scope.lb_main_all_data = {};

                $scope.getGsdHeader();
                $scope.getFactory();
                $scope.height_chart = window.innerHeight / 50;
                $scope.orderProp = 'seq';
                $scope.orderFlagProp = false;
                $scope.scrollbarConfig = {
                    theme: 'minimal-dark',
                    scrollInertia: 500
                }
                $scope.revision = {};
                factory_data = JSON.parse(localStorage.getItem("login_factory_data"));
                user_id = JSON.parse(localStorage.getItem("login_user_id"));
                console.log('init json!!', factory_data);


                //                $scope.getLinebalanceView('119');
            });
            $scope.btnOrderDefault = function (data) {
                //                var data = $scope.cdt.lbc_obj;
                var res_sort1 = alasql('SELECT * FROM ? ORDER BY CAST(gcode_id AS INT) ASC, CAST(seq AS INT) ASC', [data]);
                //                var res_sort2 = alasql('SELECT * FROM ? ORDER BY seq ASC', [res_sort1]);
                $scope.cdt.lbc_obj = res_sort1;
                $scope.cdt.order_status = '0';
                //clear graph
                //                clearGraph();
                //set graph
                $scope.updateChartValue(res_sort1);
                //                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                //                    $scope.$apply();
                //                }

            };

            $scope.btnOrderCtMaxMin = function () {
                var data = $scope.cdt.lbc_obj;
                var res = null;
                if ($scope.cdt.order_status == '0' || $scope.cdt.order_status == '2') {
                    res = alasql('SELECT * FROM ? ORDER BY cycletime ASC', [data]);
                    $scope.cdt.order_status = '1';
                } else if ($scope.cdt.order_status == '1') {
                    res = alasql('SELECT * FROM ? ORDER BY cycletime DESC', [data]);
                    $scope.cdt.order_status = '2';
                }
                $scope.cdt.lbc_obj = res;
                //clear graph
                clearGraph();
                //set graph
                $scope.updateChartValue($scope.cdt.lbc_obj);
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            };
            //            *************************************

            $scope.btnAutoData = function () {
            console.log("Click Auto Hanger", data);
                var data = $scope.cdt.lbc_obj;
                var res = null;
//                if ($scope.cdt.order_status == '0' || $scope.cdt.order_status == '2') {
//                    res = alasql('SELECT * FROM ? ORDER BY cycletime ASC', [data]);
//                    $scope.cdt.order_status = '1';
//                } else if ($scope.cdt.order_status == '1') {
//                    res = alasql('SELECT * FROM ? ORDER BY cycletime DESC', [data]);
//                    $scope.cdt.order_status = '2';
//                }
//                $scope.cdt.lbc_obj = res;
//                //clear graph
//                clearGraph();
//                //set graph
//                $scope.updateChartValue($scope.cdt.lbc_obj);
//                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
//                    $scope.$apply();
//                }
                  $scope.dialog_auto_data_pickup.show();
            };
            $scope.tb_row_color = function (row_data) {
                console.log('tb_row_color data', row_data);
            }
            function validateFormLbMain() {

                var msg_validate = "";
                if (!$scope.cdt.line_id) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Line <br>";
                }
                if (!$scope.cdt.style_data) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Style <br>";
                }
                if (!$scope.cdt.otp_target) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "เป้า/ชม OTP 100% <br>";
                }
                if (!$scope.cdt.takttime_plan) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "takt time_plan <br>";
                }
                if (!$scope.cdt.total_cycletime) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Total Cycle Time <br>";
                }
                if (!$scope.cdt.cycletime_max) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Cycle Time max(นาที/ตัว) <br>";
                }
                if (!$scope.cdt.man) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Man <br>";
                }
                if (!$scope.cdt.percent_balance) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "balance <br>";
                }
                if (!$scope.cdt.bn_position) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Position <br>";
                }
                if (!$scope.cdt.bn_employee) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Employee <br>";
                }
                if (!$scope.cdt.bn_output) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "BN Oupt put(ตัว/ชม.) <br>";
                }
                if (!$scope.cdt.bn_eff) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "% BN EFF <br>";
                }
                if (!$scope.cdt.bn_otp) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "% BN OTP";
                }
                //                if (!$scope.cdt.previous_lb) {
                //                    msg_validate += (msg_validate == "" ? "" : ",") + "";
                //                }
                if (!$scope.cdt.id) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "";
                }
                if (msg_validate != "") {
                    $ionicPopup.alert({
                        title: 'Warning Please enter !',
                        template: "<span style='color:#cc3300'>" + msg_validate + "</span>"
                    });
                    return false;
                } else {
                    return true;
                }
            }
            function clearGraph() {
                $scope.labels = [];
                $scope.data = [];
                $scope.series = [];
            }

            $scope.onClickFinish = function () {
//                if (validateFormLbMain()) {
                    var imgCanvas = document.getElementById('bar');
                    var imgContext = imgCanvas.getContext('2d');
                    //                var img = document.getElementById('img_pre');
                    //                console.log('capture2d', t);
                    var img = document.getElementById('image-preview');
                    // Make sure canvas is as big as the picture BUT make it half size to the file size is small enough
                    //                imgCanvas.width = (img.width / 4);
                    //                imgCanvas.height = (img.height / 4);
                    // Draw image into canvas element
                    imgContext.drawImage(img, 0, 0, (img.width), (img.height));
                    // Get canvas contents as a data URL
                    var imgAsDataURL = imgCanvas.toDataURL("image/png");
                    $scope.cdt.attatch_chart = imgAsDataURL;
                    console.log('base64', imgAsDataURL);
                    $scope.updateLbMainData();
//                }
            };
            $scope.updateLbMainData = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var gsd_header_id = style_data.id;
                var request = {
                    line_id: $scope.cdt.line_id,
                    gsd_header_id: gsd_header_id,
                    otp_target: $scope.cdt.otp_target,
                    takttime_plan: $scope.cdt.takttime_plan,
                    total_cycletime: $scope.cdt.total_cycletime,
                    cycletime_max: $scope.cdt.cycletime_max,
                    man: $scope.cdt.man,
                    percent_balance: $scope.cdt.percent_balance,
                    bn_position: $scope.cdt.bn_position,
                    bn_employee: $scope.cdt.bn_employee,
                    bn_output: $scope.cdt.bn_output,
                    bn_eff: $scope.cdt.bn_eff,
                    bn_otp: $scope.cdt.bn_otp,
                    //                    previous_lb: $scope.cdt.previous_lb,
                    id: $scope.cdt.id,
                    income:$scope.cdt.income,
                    eff_plan:$scope.cdt.eff_plan,
                    attatch_chart: $scope.cdt.attatch_chart,
                    eff_chance: $scope.cdt.eff_chance};
                updateLbMainData(request, function (data) {
                    console.log("updateLbMainData", data);
                    if (null != data.updateLbMain && data.updateLbMain && null != data.updatePicLbMain && data.updatePicLbMain) {
                        var updateLbMain = data.updateLbMain;
                        var updatePicLbMain = data.updatePicLbMain;
                        var msg_save = "";
                        if (updateLbMain.errorcode == "OK") {
                            msg_save = "Save Success";
                            $scope.getLinebalanceView($scope.cdt.id);
                        } else if (updatePicLbMain.errorcode == "OK") {
                            msg_save = " Cupture Success ";
                            if (updateLbMain.errorcode != "OK") {
                                msg_save += (msg_save == "" ? "" : ",") + " Save Success";
                            } else {
                                msg_save += (msg_save == "" ? "" : ",") + " Save No Success";
                            }
                        } else {
                            msg_save = "Save No Success";
                        }
                        $ionicPopup.alert({
                            title: 'Warning Save Data Seq',
                            template: msg_save
                        });
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("updateLbMainData", "ERROR");
                    hideLoading($ionicLoading);
                });
            }
            $scope.onValueChangeCct = function () {
                alert('test');
            }
            $scope.onCloseDlCtLbc = function () {
                $scope.onClickReset();
                $scope.dialog_content_lbc.hide();
            };
            $scope.onClickOkEmpCode = function () {
                $scope.cdt_dl_lbc.emp_code = $scope.cdt_dl_empcode.emp_code;
                $scope.dialog_add_empcode.hide();
            };
            $scope.onClickShowAddEmpCode = function () {
                $scope.cdt_dl_empcode.emp_code = $scope.cdt_dl_lbc.emp_code;
                $scope.dialog_add_empcode.show();
            }
            $scope.onClosePrintStd = function () {
                $scope.dialog_print_standard.hide();
            };
            $scope.onClickRowLbc = function (row_data, index) {
                if($scope.cdt.mode != 'view'){
                    console.log('row_data', row_data);
                    $scope.cdt_dl_lbc = {};
                    $scope.cdt_dl_empcode = {};
                    sum_time = 0.000;
                    var style_data = angular.fromJson($scope.cdt.style_data);
                    var gsd_header_id = style_data.id;
                    var gsd_detail_id = row_data.gsd_detail_id;
                    //              alert('gsd_header_id=' + gsd_header_id + ' ,gsd_detail_id=' + gsd_detail_id);
                    $scope.cdt_dl_lbc.emp_code = row_data.employee;
                    //                $scope.cdt_dl_lbc.group_code = row_data.code;
                    //                $scope.cdt_dl_lbc.group_name = row_data.description;
                    $scope.cdt_dl_lbc.lb_details_id = row_data.id;
                    //                alert(row_data.cycletime);
                    $scope.cdt_dl_lbc.cycletime = (row_data.cycletime - 0).toFixed(3);
                    $scope.cdt_dl_lbc.count_time = $scope.cdt_dl_lbc.cycletime;  // Remark By P.Sirintorn FEB262020

                    //new request spec
                    $scope.cdt_dl_lbc.status_id = row_data.status_id;
                    $scope_is_auto = row_data.is_auto;
                    //
                    //$scope.getGsdDetailByCdt(gsd_header_id, gsd_detail_id);  // Remark By P.Sirintorn FEB072017
    //                $scope.getWorkgroupFilter(gsd_detail_id);   // Remark By P.Sirintorn FEB072017
                    $scope.cdt_dl_lbc.group_name = row_data.description;
                    $scope.cdt_dl_lbc.group_code = row_data.code;
                    lineBalancceViewID = row_data.id;
    //                if('t' != $scope_is_auto){    // Remark By P.Sirintorn FEB252020
    //                    $scope.dialog_content_lbc.show();
    //                }
                    $scope.dialog_content_lbc.show();

                    setHighlightRow(index);
                }
            };
            $scope.onClickGraph = function (optional) {
                console.log('optional', optional);
                if (optional && optional.length > 0) {
                    //                    console.log('optional[0]',optional[0].ChartElement);
                    //                    var graph_data = optional[0].ChartElement;
                    //                    console.log('optional[0]', optional[0]);
                    //                    console.log('cdt.lbc_obj', $scope.cdt.lbc_obj);
                    var _index = optional[0]._index;
                    //                    alert(_index + 1);
                    setHighlightRow(_index);
                }
                //                alert('click');

            }
            function setHighlightRow(_index) {

                //                 console.log('row_data',row_data);
                angular.forEach($scope.cdt.lbc_obj, function (data_for, index) {
                    //                    console.log('loop data',data_for);
                    if (index == _index) {
                        $scope.cdt.lbc_obj[index].select_row = true;
                        //                        data_for.select_row = true;

                    } else {
                        $scope.cdt.lbc_obj[index].select_row = false;
                        //                        data_for.select_row = false;
                    }
                    //                    console.log('for!!', data_for.id + ' : ' + gsd_detail_id)
                    //                    if (data_for.id == gsd_detail_id) {
                    //                        default_sel_data = data_for;
                    //                    }
                });
                //                $scope.$apply();
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    //                    alert('update src')
                    $scope.$apply();
                }
            }
            function vldFormAdd() {
                var msg_validate = "";
                if (!$scope.cdt.factory_id) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Location";
                }

                if (!$scope.cdt.line_id) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Line";
                }
                if (!$scope.cdt.customer) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Customer";
                }
                if (!$scope.cdt.style_data) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "Style";
                }
                if (!$scope.cdt.otp_target) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "เป้า/ชม OTP 100%";
                }
                //                    if (!gsd_header_id) {
                //                        msg_validate = (msg_validate == "" ? "" : ",") + "Line";
                //                    }
                //                    alert($scope.cdt.takttime_plan);
                if (!$scope.cdt.takttime_plan) {
                    msg_validate += (msg_validate == "" ? "" : ",") + "takt time_plan";
                }



                if (msg_validate == "") {
                    return true;
                } else {

                    $ionicPopup.alert({
                        title: 'Warning Add Data To Lb_main',
                        template: "&emsp;<b>Please Enter Data !</b> <br><span style='color:#cc3300'>" + msg_validate + "</span>"
                    });
                    return false;
                }

            }
//            function getColorChart(value) {   //Remark by P.Sirintorn NOV052017
//                if (value) {
//                } else if (value) {
//
//                } else if (value) {
//
//                }
//            }
            $scope.onClickGcode = function () {
                $scope.dialog_gcode.show();
            };
            $scope.onClickGroup = function () {
                $scope.dialog_group.show();
            };
            $scope.onClickAdd = function () {
                clearTimerDataGrid();
                //                $scope.getLinebalanceViewz($scope.cdt.line_id);
                //                if (!$scope.cdt.id) {
                if (vldFormAdd()) {
                    if (!$scope.cdt.id) {
//                        $scope.getGsdHeaderByCdt();

                        $scope.addLbMain();
                    } else {
                        $scope.cdt_dl_as = {};
                        $scope.dialog_add_seq.show();
                        //$scope.getWorkgroup();    // P.Sirintorn MAR192017
                        $scope.getGcode();
                    }
                }
            };

            $scope.onClickNewRevision = function () {
                clearTimerDataGrid();
                //                $scope.getLinebalanceViewz($scope.cdt.line_id);
                //                if (!$scope.cdt.id) {
                if (vldFormAdd()) {
                $scope.cdt.id = ''
                    if (!$scope.cdt.id) {
                    //alert('if '+$scope.cdt.id)
                        $scope.addLbMain();

                        //$scope.getLbMainByCdt();          //Remark By P.Sirintorn JUL292017
                        //$scope.getLinebalanceView();  //Remark By P.Sirintorn JUL292017
                    }

                }
            };

            $scope.onClickUpdateLbMain = function () {
				clearTimerDataGrid();
				//                $scope.getLinebalanceViewz($scope.cdt.line_id);
				//                if (!$scope.cdt.id) {
				if (vldFormAdd()) {
					$scope.updateLbMainTaktTime();
				}
			};


            $scope.updateLbMainTaktTime = function (data_obj) {
				showLoading($ionicLoading);
				//                line_id=?,gsd_header_id=?,takttime_plan=?,otp_target=?
				var request = {
					id: $scope.cdt.id
					, otp_target: $scope.cdt.otp_target
					, takttime_plan: $scope.cdt.takttime_plan
					, income: $scope.cdt.income
					, eff_plan: $scope.cdt.eff_plan
					, eff_chance: $scope.cdt.eff_chance
				};
				updateLbMainByCdtTaktTime(request, function (data) {
					console.log("updateLbMainByCdtTaktTime", data);
                    var msg_save = "";
                    if (data.errorcode == "OK") {
                        msg_save = "Save Success";
                        $scope.getLbMainByCdt();        //Remark By P.Sirintorn JUN132017
                    } else {
                        msg_save = "Save No Success";
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning Save',
                        template: msg_save
                    });
                    alertPopup.then(function (res) {
                        console.log('Close Dialog Go to btnOrderDefault');
                        if (data.errorcode == "OK") {
					//เรียงข้อมูลใหม่และเอาข้อมูลที่เรียงแล้วไปsetลงกราฟ
                    $scope.btnOrderDefault(data_obj);
					$scope.getLbMainByCdt();
                    }
                });
					hideLoading($ionicLoading);
				}, function () {
					console.log("updateLbMainByCdtTaktTime", "ERROR");
				});
            };
            $scope.closeSeqDialog = function () {
                flag_timer = true;
                timerDataGrid();
                $scope.dialog_add_seq.hide();
            }
            function validateAddSeq() {
                var msg_validate = "";
                if (!($scope.cdt_dl_as.emp_qty && $scope.cdt_dl_as.emp_qty > 0)) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "จำนวนพนักงาน 1-99 เท่านั้น";
                }
                if (!$scope.cdt_dl_as.gcode_id) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Group Code";
                }
                if (!$scope.cdt_dl_as.group_name) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Group Name";
                }
                if (msg_validate != "") {
                    $ionicPopup.alert({
                        title: 'Warning Add Seq',
                        template: "Please Enter!!!<br>" + msg_validate
                    });
                    hideLoading($ionicLoading);
                    return false;
                } else {
                    return true;
                }
            }


            $scope.onClickOkAs = function () {

                showLoading($ionicLoading);
                if (validateAddSeq()) {
                var user_id = null;
                user_id = JSON.parse(localStorage.getItem("login_user_id"));

                    if ($scope.cdt_dl_as.after_seq == 0 && $scope.cdt_dl_as.seq_max == 0) {
                        //                        alert('1');
                        //                        @FormParam("emp_qty") String emp_qty, @FormParam("lb_main_id") String lb_main_id
                        $scope.addLbDetails($scope.cdt_dl_as.emp_qty, $scope.cdt.id, $scope.cdt_dl_as.workgroup_id, $scope.cdt_dl_as.gcode_id, user_id);
                    } else if ($scope.cdt_dl_as.after_seq != 0 && $scope.cdt_dl_as.seq_max > 0) {
                        //                        alert('2');
                        var after_seq = $scope.cdt_dl_as.after_seq;
                        var seq_max = $scope.cdt_dl_as.seq_max;
                        var emp_qty = $scope.cdt_dl_as.emp_qty;
                        var lb_main_id = $scope.cdt.id;
                        var gcode_id = $scope.cdt_dl_as.gcode_id;


                        $scope.upOldLbDAddNewLbD(after_seq, seq_max, emp_qty, lb_main_id, $scope.cdt_dl_as.workgroup_id, gcode_id, user_id);
                    }
                }

            }
            $scope.upOldLbDAddNewLbD = function (after_seq, seq_max, emp_qty, lb_main_id, workgroup_id, gcode_id, user_id) {
                var request = {after_seq: after_seq, seq_max: seq_max, emp_qty: emp_qty, lb_main_id: lb_main_id, workgroup_id: workgroup_id, gcode_id: gcode_id, user_id : user_id};
                upOldLbDAddNewLbD(request, function (data) {
                    console.log("upOldLbDAddNewLbD", data);
                    if (null != data.updateLbDetailBySeq && data.updateLbDetailBySeq && null != data.addLbDetail && data.addLbDetail)
                    {
                        var updateLbDetailBySeq = data.updateLbDetailBySeq[0];
                        var addLbDetail = data.addLbDetail[0];
                        var msg_save = "";
                        if ((updateLbDetailBySeq && updateLbDetailBySeq.errorcode == "OK") || (addLbDetail && addLbDetail.errorcode == "OK"))
                        {
                            msg_save = "Save Success";
                        } else {
                            msg_save = "Save No Success";
                        }
                        var alertPopup = $ionicPopup.alert({
                            title: 'Status Save',
                            template: msg_save
                        });
                        alertPopup.then(function (res) {
                            console.log('Close Dialog Go to getLbMainByCdt');
                            if (msg_save == "Save Success") {
                                $scope.dialog_add_seq.hide();
                                $scope.getLinebalanceView(lb_main_id, true);
                                flag_timer = true;
                                timerDataGrid();
                            }
                        });
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("upOldLbDAddNewLbD", "ERROR");
                });
            }

            $scope.deleteRowLbDetails = function (row_data) {
                console.log('delete row ', row_data);
                // A confirm dialog
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Warning Delete Lb Details',
                    template: 'Are you sure you want to delete this row?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $scope.deleteLbDetail(row_data.id, row_data.seq, row_data.gsd_detail_id, row_data.gcode_id);
                        console.log('You are sure');
                    } else {
                        console.log('You are not sure');
                    }
                });
            };

            $scope.deleteLbDetail = function (id, seq_delete, workgroup_id, gcode_id) {
                showLoading($ionicLoading);
                var request = {id: id, seq_delete: seq_delete, workgroup_id: workgroup_id, gcode_id: gcode_id};
                deleteLbDetail(request, function (data) {
                    var msg_save = "";
                    console.log("deleteLbDetail", data);
                    if (data.errorcode == "OK") {
                        msg_save = "Delete LbDetail Success ";
                    } else {
                        msg_save = "Delete LbDetail No Success ";
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning Status Delete',
                        template: msg_save
                    });
                    alertPopup.then(function (res) {
                        if (data.errorcode == "OK") {
                            $scope.getLinebalanceView($scope.cdt.id, true);
                        }
                    });
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("deleteLbDetail", "ERROR");
                    hideLoading($ionicLoading);
                });
            }

            $scope.addLbDetails = function (emp_qty, line_id, workgroup_id, gcode_id, user_id) {

                //                @FormParam("emp_qty") String emp_qty, @FormParam("lb_main_id") String lb_main_id
                var request = {emp_qty: emp_qty, lb_main_id: line_id, workgroup_id: workgroup_id, gcode_id: gcode_id, user_id: user_id};

                addLbDetails(request, function (data) {
                    console.log("addLbDetails", data);
                    if (null != data.addLbDetails && data.addLbDetails) {
                        var data_res = data.addLbDetails[0];
                        var msg_save = "";
                        if (data_res.errorcode == "OK") {
                            msg_save = "Save LbDetail Success ";
                        } else {
                            msg_save = "Save LbDetail No Success ";
                        }
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning Status Save',
                            template: msg_save
                        });
                        alertPopup.then(function (res) {

                            console.log('Close Dialog Go to getLbMainByCdt');
                            if (data_res.errorcode == "OK") {
                                $scope.dialog_add_seq.hide();
                                $scope.getLinebalanceView(line_id, true);
                                flag_timer = true;
                                timerDataGrid();
                            }
                        });
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("addLbDetails", "ERROR");
                    hideLoading($ionicLoading);
                });
            }
            $scope.onChangeAfSq = function () {
                //after max ใส่ค่าได้ไม่เกิน max ที่ query มาเท่านั้น
                if ($scope.cdt_dl_as.after_seq - 0 > $scope.cdt_dl_as.seq_max - 0) {
                    $scope.cdt_dl_as.after_seq = $scope.cdt_dl_as.seq_max - 0;
                }
            }

            $scope.onChangeWip = function (){
                wip = $scope.cdt.wip;
            }

            $ionicModal.fromTemplateUrl('templates/dialog_gcode.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_gcode = modal;
            });

            $ionicModal.fromTemplateUrl('templates/dialog_group.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_group = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_add_seq.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_add_seq = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_content_lbc.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_content_lbc = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_add_empcode.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_add_empcode = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_gsd_header.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_gsd_header = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_print_standard.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_print_standard = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_auto_data_pickup.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_auto_data_pickup = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_style.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_style = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_revision.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_revision = modal;
            });
            //            // Triggered in the login modal to close it
            //            $scope.closeCustModal = function () {
            //                $scope.modal_cust.hide();
            //            };
            $scope.saveLbDetail = function () {

                showLoading($ionicLoading);
                if (validateSaveLbDetail()) {
                    var request = {
//                        gsd_detail_id: $scope.cdt_dl_lbc.gsd_detail_data.id,
                        employee: $scope.cdt_dl_lbc.emp_code
                        , cycletime: $scope.cdt_dl_lbc.cycletime
                        , id: $scope.cdt_dl_lbc.lb_details_id
                        , status_id: $scope.cdt_dl_lbc.status_id
                        , user_id: user_id};

                    updateLbDetailByCdt(request, function (data) {
                        console.log('updateLbDetailByCdt', data);
                        if (data.errorcode == "OK") {
                            $scope.dialog_content_lbc.hide();
                            $scope.getLinebalanceView($scope.cdt.id, true);
                        } else {

                        }
                        //                        $scope.dialog_content_lbc.show();
                        hideLoading($ionicLoading);
                    }, function () {
                        alert('error!');
                        console.log("ERROR updateLbDetailByCdt", "ERROR");
                        hideLoading($ionicLoading);
                    });
                }
            };
            function validateSaveLbDetail() {
                var msg_save = "";
                if (!$scope.cdt_dl_lbc.emp_code) {
                    msg_save += (msg_save == "" ? "" : ",") + "Employee Code";
                }
//                if (!$scope.cdt_dl_lbc.gsd_detail_data) {
//                    msg_save += (msg_save == "" ? "" : ",") + "Group Code";
//                }
                if (!$scope.cdt_dl_lbc.cycletime || $scope.cdt_dl_lbc.cycletime == 0) {
                    msg_save += (msg_save == "" ? "" : ",") + "Cycletime";
                }
                if (msg_save != "") {
                    $ionicPopup.alert({
                        title: 'Prepare Data To Save',
                        template: "Please " + "<span style='color:#cc3300'>" + msg_save + "</span>"
                    });
                    hideLoading($ionicLoading);
                    return false;
                } else {
                    return true;
                }
            }
            $scope.onChangeGsdDetail = function () {
                if ($scope.cdt_dl_lbc.gsd_detail_data) {
                    var sel_group_name = $scope.cdt_dl_lbc.gsd_detail_data.description;
                    $scope.cdt_dl_lbc.group_name = sel_group_name;
                } else {
                    $scope.cdt_dl_lbc.group_name = '';
                }
            };
            $scope.getGsdDetailByCdt = function (gsd_header_id, gsd_detail_id) {
                showLoading($ionicLoading);
                //                alert();
                var request = {gsd_header_id: gsd_header_id, gsd_detail_id: gsd_detail_id};
                getGsdDetailByCdt(request, function (data) {
                    console.log("getGsdDetailByCdt", data);
                    if (data.errorcode == "OK") {
                        //                        alert('2');
                        $scope.cdt_dl_lbc.gsd_detail_obj = data.data;
                        var default_sel_data;
                        angular.forEach(data.data, function (data_for, index) {
                            //                            console.log('for!!', data_for.id + ' : ' + gsd_detail_id)
                            if (data_for.id == gsd_detail_id) {
                                default_sel_data = data_for;
                            }
                        });
                        if (default_sel_data) {
                            $scope.cdt_dl_lbc.gsd_detail_data = default_sel_data;
                            $scope.cdt_dl_lbc.group_name = default_sel_data.description;
                        }
                    } else {
                        $scope.cdt_dl_lbc.gsd_detail_obj = data.data;
                        $scope.cdt_dl_lbc.group_name = "";
                        //                        $scope.cdt.factory_obj = {};
                    }
                    $scope.dialog_content_lbc.show();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdDetailByCdt", "ERROR");
                });
            }

            $scope.getWorkgroupFilter = function (workgroup_id) {
                showLoading($ionicLoading);
                var request = {workgroup_id: workgroup_id};

                getWorkgroupFilter(request, function (data) {
                    //alert();
                    console.log("getWorkgroupFilter", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_lbc.gsd_detail_obj = data.data;
                        var default_sel_data;
                        angular.forEach(data.data, function (data_for, index) {
                            // console.log('for!!', data_for.id + ' : ' + gsd_detail_id)
                            if (data_for.id == workgroup_id) {

                                default_sel_data = data_for;
                            }
                        });
                        if (default_sel_data) {

                            $scope.cdt_dl_lbc.gsd_detail_data = default_sel_data;
                            $scope.cdt_dl_lbc.group_name = default_sel_data.group_name;
                            $scope.cdt_dl_lbc.group_code = default_sel_data.group_code;

                        }
                    } else {
                        $scope.cdt_dl_lbc.gsd_detail_obj = data.data;
                        $scope.cdt_dl_lbc.group_name = "";
                        //                        $scope.cdt.factory_obj = {};
                    }
                    $scope.dialog_content_lbc.show();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getWorkgroupFilter", "ERROR");
                });
            }

            function validateAddGroupCode() {
                var msg_validate = "";
                if (!$scope.cdt_dl_gcode.group_code) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Group Code";
                }
                if (msg_validate != "") {
                    $ionicPopup.alert({
                        title: 'Warning Save',
                        template: "Please Enter!!!<br>" + msg_validate
                    });
                    return false;
                } else {
                    return true;
                }
            }
            function validateAddGroupName() {
                var msg_validate = "";
//                if (!$scope.cdt_dl_group.group_code) {
//                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Group Code";
//                }
                if (!$scope.cdt_dl_group.group_name) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Group Name";
                }
                if (msg_validate != "") {
                    $ionicPopup.alert({
                        title: 'Warning Save',
                        template: "Please Enter!!!<br>" + msg_validate
                    });
                    return false;
                } else {
                    return true;
                }
            }
            $scope.onClickAddGroup = function () {
                if (validateAddGroupName()) {
                    showLoading($ionicLoading);
                    var request = {group_code: $scope.cdt_dl_group.group_code, group_name: $scope.cdt_dl_group.group_name};
                    addWorkgroup(request, function (data) {
                        console.log("addWorkgroup", data);
                        var msg_save = "";
                        if (data.errorcode == "OK") {
                            msg_save = "Save Success";
                            //                        $scope.dialog_gsd_header.hide();
                            $scope.getWorkgroup();
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                        } else {
                            msg_save = "Save No Success";
                            hideLoading($ionicLoading);
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                        }
                        $ionicPopup.alert({
                            title: 'Status Save',
                            template: msg_save
                        });
                    }, function () {
                        console.log("addWorkgroup", "ERROR");
                    });
                }
            };
            $scope.onClickAddGcode = function () {
                if (validateAddGroupCode()) {
                    showLoading($ionicLoading);
                    var request = {code: $scope.cdt_dl_gcode.group_code};
                    addGcode(request, function (data) {
                        console.log("addGcode", data);
                        var msg_save = "";
                        if (data.errorcode == "OK") {
                            msg_save = "Save Success";
                            //                        $scope.dialog_gsd_header.hide();
                            $scope.getGcode();
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                        } else {
                            msg_save = "Save No Success";
                            hideLoading($ionicLoading);
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                        }
                        $ionicPopup.alert({
                            title: 'Status Save',
                            template: msg_save
                        });
                    }, function () {
                        console.log("addGcode", "ERROR");
                    });
                }
            };
            $scope.onClickRowGroup = function (group_data) {
//                $scope.cdt_dl_as.group_code = group_data.group_code;
                $scope.cdt_dl_as.group_name = group_data.group_name;
                $scope.cdt_dl_as.workgroup_id = group_data.id;
                //if group_name and group_code is true go to get max after seq
                if ($scope.cdt_dl_as.group_name && $scope.cdt_dl_as.gcode) {
                    $scope.getMaxSeqLbD($scope.cdt.id, $scope.cdt_dl_as.workgroup_id, $scope.cdt_dl_as.gcode_id);
                }
                $scope.dialog_group.hide();
            };
            $scope.onClickRowGcode = function (group_data) {
                $scope.cdt_dl_as.group_name = "";
                $scope.cdt_dl_as.gcode = group_data.code;
                $scope.cdt_dl_as.gcode_id = group_data.id;
                //if group_name and group_code is true go to get max after seq
                if ($scope.cdt_dl_as.group_name && $scope.cdt_dl_as.gcode) {
                    $scope.getMaxSeqLbD($scope.cdt.id, $scope.cdt_dl_as.workgroup_id, $scope.cdt_dl_as.gcode_id);

                }
                $scope.dialog_gcode.hide();
                $scope.getWorkgroupGcodeFilter($scope.cdt_dl_as.gcode_id);  //P.Sirintorn MAR192017

            };
            $scope.getWorkgroupGcodeFilter = function (gcode_id) {
                showLoading($ionicLoading);
                $scope.cdt_dl_group = {};
                //var request = {request: ''}; // P.Sirintorn MAR192017
                 var request = {gcode_id: gcode_id};

                getWorkgroupGcodeFilter(request, function (data) {
                    console.log("getWorkgroupGcodeFilter", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_group.group_obj = data.data;
                    } else {
                        $scope.cdt_dl_group.group_obj = [];
                    }
                    //                    $scope.dialog_content_lbc.show();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("gsdWorkgroup", "ERROR");
                });
            }

            $scope.getGcode = function () {
                showLoading($ionicLoading);
                $scope.cdt_dl_gcode = {};
                var request = {request: ''};
                getGcode(request, function (data) {
                    console.log("getGcode", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_gcode.gcode_obj = data.data;

                    } else {
                        $scope.cdt_dl_gcode.gcode_obj = [];
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGcode", "ERROR");
                });
            }
            $scope.getFactory = function () {
                showLoading($ionicLoading);
                var request = {request: ''};
                getFactory(request, function (data) {
                    console.log("getFactory", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.factory_obj = data.data;
                        $scope.cdt.factory_data = factory_data;
                        $scope.cdt.factory_id = factory_data.id;
                        $scope.getLineBuilFac(factory_data.id);
                    } else {
                        $scope.cdt.factory_obj = {};
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getFactory", "ERROR");
                });
            }
            $scope.onChangeFactory = function () {
            //CLEAR FORM
                $scope.cdt.ga_detail_obj = [];

                showLoading($ionicLoading);
                //clear ddl line
                $scope.cdt.line_id = '';
                $scope.cdt.line_data = {};
                $scope.cdt.lbf_obj = [];

                var factory_data = angular.fromJson($scope.cdt.factory_data);
                //set value default to another program
                localStorage.setItem("login_factory_data", JSON.stringify($scope.cdt.factory_data));
                $scope.cdt.factory_id = factory_data.id;
                $scope.getLineBuilFac(factory_data.id);
            };

            $scope.getLineBuilFac = function (factory_id) {
                 var request = {factory_id: factory_id};
                 getLineBuilFac(request, function (data) {
                     console.log("getLineBuilFac", data);
                     if (data.errorcode == "OK") {
                         $scope.cdt.lbf_obj = data.data;
                         $scope.$apply();
                     } else {
                         $scope.cdt.lbf_obj = [];
                     }
                     $scope.$apply();
                     hideLoading($ionicLoading);
                 }, function () {
                     console.log("getLineBuilFac", "ERROR");
                 });
            }
//            $scope.onChangeFactory = function () {    // Remark By P.Sirintorn JUN202017
//                console.log('onChangeFactory!!', $scope.cdt.factory_data);
//                showLoading($ionicLoading);
//
//                var factory_data = angular.fromJson($scope.cdt.factory_data);
//                //set value default to another program
//                localStorage.setItem("login_factory_data", JSON.stringify($scope.cdt.factory_data));
//                $scope.cdt.factory_id = factory_data.id;
//                $scope.cdt.user_id = factory_data.user_id;
//                //clear ddl line
//                $scope.cdt.line_id = '';
//                $scope.cdt.lbf_obj = [];
//                //clear ddl customer
//                $scope.cdt.customer = '';
//                $scope.cdt.cust_obj = [];
//                //clear ddl style
//                $scope.cdt.style = '';
//                $scope.cdt.style_data = '';
//                $scope.cdt.style_obj = [];
//                //clear form input
//                $scope.cdt.mode = '';
//                $scope.cdt.id = '';
//                $scope.cdt.total_sam = 0;
//                $scope.cdt.otp_target = 0;
//                $scope.cdt.takttime_plan = 0;
//                $scope.cdt.total_cycletime = '';
//                $scope.cdt.cycletime_max = '';
//                $scope.cdt.man = '';
//                $scope.cdt.percent_balance = '';
//                $scope.cdt.bn_position = '';
//                $scope.cdt.bn_employee = '';
//                $scope.cdt.bn_output = '';
//                $scope.cdt.bn_eff = '';
//                $scope.cdt.bn_otp = '';
//                $scope.cdt.last_update = '';
//                $scope.cdt.lbc_obj = [];
//                $scope.cdt.attatch_chart = '';
//                clearGraph();
////                console.log('$scope.cdt.factory_id',$scope.cdt.factory_id);
//                $scope.getLineBuilFac($scope.cdt.factory_id);
//            };
            $scope.getLineBuilFac = function (factory_id) {
                var request = {factory_id: factory_id};
                getLineBuilFac(request, function (data) {
                    console.log("getLineBuilFac", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.lbf_obj = data.data;
                        $scope.$apply();
                    } else {
                        $scope.cdt.lbf_obj = {};
                    }
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getLineBuilFac", "ERROR");
                });
            }

            $scope.onChangeLine = function () {
                var line_data = angular.fromJson($scope.cdt.line_data);
                $scope.cdt.line_id = line_data.line_id;
                //clear form
                //clear ddl customer
                $scope.cdt.customer = '';
                $scope.cdt.cust_obj = [];
                //clear ddl style
                $scope.cdt.style = '';
                $scope.cdt.style_data = '';
                $scope.cdt.style_obj = [];
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = 0;
                $scope.cdt.takttime_plan = 0;
                $scope.cdt.total_cycletime = '';
                $scope.cdt.cycletime_max = '';
                $scope.cdt.man = '';
                $scope.cdt.percent_balance = '';
                $scope.cdt.bn_position = '';
                $scope.cdt.bn_employee = '';
                $scope.cdt.bn_output = '';
                $scope.cdt.bn_eff = '';
                $scope.cdt.bn_otp = '';
                $scope.cdt.last_update = '';
                $scope.cdt.lbc_obj = [];
                $scope.cdt.attatch_chart = '';
                $scope.cdt.income = 0;
                $scope.cdt.eff_plan = 0;
                $scope.cdt.wip = wip;
                $scope.cdt.p_red = 0;
                $scope.cdt.p_green = 0;
                $scope.cdt.p_yellow = 0;
                $scope.cdt.p_orange = 0;
                $scope.cdt.is_auto = line_data.is_auto;
                $scope.cdt.max_station_id = 0;
                $scope.cdt.roundcount = 0;
                clearGraph();

                $scope.getPdtPlan(line_data.code);
            }
            $scope.getPdtPlan = function (line_code) {
                showLoading($ionicLoading);
                var request = {line_code: line_code};
                getPdtPlan(request, function (data) {
                    console.log("getPdtPlan", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_style.style_obj = data.data;
                    } else {
                        $scope.cdt_dl_style.style_obj = [];
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getPdtPlan", "ERROR");
                });
            }
            $scope.getGsdHeader = function () {
                showLoading($ionicLoading);
                var request = {request: ''};
                getGsdHeader(request, function (data) {
                    console.log("getGsdHeaderAll", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    } else {
                        $scope.cdt_dl_gsd.gsd_header_obj = [];
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeaderAll", "ERROR");
                });
            };
            $scope.onClickRowCust = function (data) {
                $scope.dialog_gsd_header.hide();
                $scope.cdt.customer = data.customer;
                $scope.getGsdHeaderByCust(data.customer);
            }

            $scope.getGsdHeaderByCust = function (customer) {
                showLoading($ionicLoading);
                var request = {customer: customer};
                getGsdHeaderByCust(request, function (data) {
                    console.log("getGsdHeaderByCust ", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_style.style_obj = data.data;
                    } else {
                        $scope.cdt_dl_style.style_obj = [];
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeaderByCust ", "ERROR");
                });
            }
            $scope.onChangeCust = function () {
                //clear ddl style
                $scope.cdt.style = '';
                $scope.cdt.style_data = '';
                $scope.cdt.style_obj = [];
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = 0;
                $scope.cdt.takttime_plan = 0;
                $scope.cdt.total_cycletime = '';
                $scope.cdt.cycletime_max = '';
                $scope.cdt.man = '';
                $scope.cdt.percent_balance = '';
                $scope.cdt.bn_position = '';
                $scope.cdt.bn_employee = '';
                $scope.cdt.bn_output = '';
                $scope.cdt.bn_eff = '';
                $scope.cdt.bn_otp = '';
                $scope.cdt.last_update = '';
                $scope.cdt.lbc_obj = [];
                $scope.cdt.attatch_chart = '';
                $scope.cdt.income = 0;
                $scope.cdt.eff_plan = 0;
                $scope.cdt.wip = wip;
                $scope.cdt.p_red = 0;
                $scope.cdt.p_green = 0;
                $scope.cdt.p_yellow = 0;
                $scope.cdt.p_orange = 0;
                $scope.cdt.is_auto = line_data.is_auto;
                $scope.cdt.max_station_id = 0;

                clearGraph();
                $scope.getGsdHeaderByCust($scope.cdt.customer);
            }
            $scope.onChangeOptTakt = function () {
//                $scope.cdt.total_sam = 0;
                nb = $scope.cdt.otp_target;
                na = (nb/b)*a;
                nc = (nb/b)*c;
                // Remark OCT092017 By P.Sirintorn
//                $scope.cdt.income = parseFloat((na-0).toFixed(2));
//                $scope.cdt.eff_plan = parseFloat((nc-0).toFixed(2));
                $scope.cdt.income = parseFloat((na-0).toFixed(2));
                $scope.cdt.eff_plan = parseFloat((nc-0).toFixed(0));
                $scope.cdt.takttime_plan = parseFloat(((60 / $scope.cdt.otp_target) - 0).toFixed(3));

//                clearGraph();
//                $scope.getGsdHeaderByCust($scope.cdt.customer);
            }

            $scope.getLbMainByCdt = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var request = {line_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                getLbMainByCdt(request, function (data) {
                    console.log("getLbMainByCdt ", data);

                    if (data.errorcode == "OK") {
                        var lb_main_data = data.data[0];

                        max_rev = lb_main_data.revision;
                        $scope.cdt.mode = 'update';
                        $scope.cdt.id = lb_main_data.id;

                        $scope.cdt.total_sam = (lb_main_data.sam_gsd - 0).toFixed(3);
                        //                        console.log('(lb_main_data.otp_target - 0).toFixed(3)',(lb_main_data.otp_target - 0).toFixed(3));
                        $scope.cdt.otp_target = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                        b = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                        $scope.cdt.takttime_plan = parseFloat((lb_main_data.takttime_plan - 0).toFixed(3));
                        $scope.cdt.total_cycletime = parseFloat((lb_main_data.total_cycletime - 0).toFixed(3));
                        $scope.cdt.cycletime_max = parseFloat((lb_main_data.cycletime_max - 0).toFixed(3));
                        $scope.cdt.man = lb_main_data.man - 0;
                        $scope.cdt.percent_balance = parseFloat((lb_main_data.percent_balance - 0).toFixed(3));
                        $scope.cdt.bn_position = lb_main_data.bn_position;
                        $scope.cdt.bn_employee = lb_main_data.bn_employee;
                        $scope.cdt.bn_output = parseFloat((lb_main_data.bn_output -0).toFixed(3));
                        $scope.cdt.bn_eff = parseFloat((lb_main_data.bn_eff - 0).toFixed(3));
                        $scope.cdt.bn_otp = parseFloat((lb_main_data.bn_otp - 0).toFixed(3));
                        $scope.cdt.last_update = lb_main_data.create_datetime;

                        //Remark OCT092017 By P.Sirintorn
//                        $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
//                        a = parseFloat((lb_main_data.income - 0).toFixed(2));
//                        $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
//                        c = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
                        $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
                        a = parseFloat((lb_main_data.income - 0).toFixed(0));
                        $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));
                        c = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));

                        //Remark SEP072018 By P.Sirintorn
                        $scope.cdt.p_red = lb_main_data.p_red;
                        $scope.cdt.p_green = lb_main_data.p_green;
                        $scope.cdt.p_yellow = lb_main_data.p_yellow;
                        $scope.cdt.p_orange = lb_main_data.p_orange;

                        //Remark NOV232022 By P.Sirintorn
                        if(lb_main_data.eff_chance == 0){
                            $scope.cdt.eff_chance = "  N/A"
                        }else{
                            $scope.cdt.eff_chance = parseFloat((lb_main_data.eff_chance - 0).toFixed(3));
                        }
                        //====================================================================

                        showLoading($ionicLoading);
                        $scope.getLinebalanceView($scope.cdt.id);
//                        $scope.getLinebalanceView($scope.cdt.id);
                        flag_timer = true;
                        timerDataGrid();

                    } else {
                        $scope.cdt.mode = 'insert';
                        $scope.cdt.id = '';
                        $scope.cdt.total_sam = (style_data.sam_gsd - 0).toFixed(3);
                        $scope.cdt.otp_target = 0;
                        $scope.cdt.takttime_plan = 0;
                        $scope.cdt.total_cycletime = '';
                        $scope.cdt.cycletime_max = '';
                        $scope.cdt.man = '';
                        $scope.cdt.percent_balance = '';
                        $scope.cdt.bn_position = '';
                        $scope.cdt.bn_employee = '';
                        $scope.cdt.bn_output = '';
                        $scope.cdt.bn_eff = '';
                        $scope.cdt.bn_otp = '';
                        $scope.cdt.last_update = '';
                        //                        $scope.cdt.lbc_obj = [];
                        $scope.cdt.attatch_chart = '';
                        $scope.cdt.shouldBeOpen = true;
                        $scope.cdt.income = 0;
                        $scope.cdt.eff_plan = 0;
                        $scope.cdt.wip = wip;
                        $scope.cdt.p_red = 0;
                        $scope.cdt.p_green = 0;
                        $scope.cdt.p_yellow = 0;
                        $scope.cdt.p_orange = 0;
                        $scope.cdt.eff_chance = 0;
                        clearGraph();
                        $scope.getCrdateFrLbMainByMax();
                    }
                    hideLoading($ionicLoading);
                    //                    $scope.$apply();
                }, function () {
                    console.log("getLbMainByCdt ", "ERROR");
                });
            }


            $scope.getCustomerByCode = function (style) {
                showLoading($ionicLoading);
                var request = {style: style};
                getCustomerByCode(request, function (data) {
                    console.log("getCustomerByCode", data);
                    if (data.errorcode == "OK") {
                        if (data.data && data.data.length > 0) {
                            var cust_data = data.data[0];
                            $scope.cdt.customer = cust_data.customer;
                            $scope.cdt.customer_id = cust_data.id;
                            $scope.getLbMainByCdt();

                        } else {
                            $scope.cdt.customer = '';
                        }
                    } else {
                        $scope.cdt.customer = '';
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getCustomerByCode", "ERROR");
                });
            }

            $scope.onClickRowStyle = function (data) {
                $scope.cdt.style_data = data;
                $scope.cdt.style = data.style;
                $scope.cdt.total_sam = 0.000;
//                $scope.cdt.total_sam = (data.sam_gsd - 0).toFixed(3);

                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = 0;
                $scope.cdt.takttime_plan = 0;
                $scope.cdt.total_cycletime = '';
                $scope.cdt.cycletime_max = '';
                $scope.cdt.man = '';
                $scope.cdt.percent_balance = '';
                $scope.cdt.bn_position = '';
                $scope.cdt.bn_employee = '';
                $scope.cdt.bn_output = '';
                $scope.cdt.bn_eff = '';
                $scope.cdt.bn_otp = '';
                $scope.cdt.last_update = '';
                $scope.cdt.lbc_obj = [];
                $scope.cdt.attatch_chart = '';
                $scope.cdt.income = 0;
                $scope.cdt.eff_plan = 0;
                $scope.cdt.wip = wip;
                $scope.cdt.p_red = 0;
                $scope.cdt.p_green = 0;
                $scope.cdt.p_yellow = 0;
                $scope.cdt.p_orange = 0;
                clearGraph();

                $scope.getCustomerByCode(data.style);
                $scope.dialog_style.hide();
            }

            $scope.onSelectRevision = function (data) {
                var lb_main_data = data;
                if(lb_main_data.revision == max_rev){
                    $scope.cdt.mode = 'update';
                }else{
                    $scope.cdt.mode = 'view';
                }

                $scope.cdt.id = lb_main_data.id;
                $scope.cdt.total_sam = (lb_main_data.sam_gsd - 0).toFixed(3);
                //                        console.log('(lb_main_data.otp_target - 0).toFixed(3)',(lb_main_data.otp_target - 0).toFixed(3));
                $scope.cdt.otp_target = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                b = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                $scope.cdt.takttime_plan = parseFloat((lb_main_data.takttime_plan - 0).toFixed(3));
                $scope.cdt.total_cycletime = parseFloat((lb_main_data.total_cycletime - 0).toFixed(3));
                $scope.cdt.cycletime_max = parseFloat((lb_main_data.cycletime_max - 0).toFixed(3));
                $scope.cdt.man = lb_main_data.man - 0;
                $scope.cdt.percent_balance = parseFloat((lb_main_data.percent_balance - 0).toFixed(3));
                $scope.cdt.bn_position = lb_main_data.bn_position;
                $scope.cdt.bn_employee = lb_main_data.bn_employee;
                $scope.cdt.bn_output = parseFloat((lb_main_data.bn_output -0).toFixed(3));
                $scope.cdt.bn_eff = parseFloat((lb_main_data.bn_eff - 0).toFixed(3));
                $scope.cdt.bn_otp = parseFloat((lb_main_data.bn_otp - 0).toFixed(3));
                $scope.cdt.last_update = lb_main_data.create_datetime;

                //Remark OCT092017 By P.Sirintorn
    //                        $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
    //                        a = parseFloat((lb_main_data.income - 0).toFixed(2));
    //                        $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
    //                        c = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
                $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
                a = parseFloat((lb_main_data.income - 0).toFixed(0));
                $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));
                c = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));

                //Remark SEP072018 By P.Sirintorn
                $scope.cdt.p_red = lb_main_data.p_red;
                $scope.cdt.p_green = lb_main_data.p_green;
                $scope.cdt.p_yellow = lb_main_data.p_yellow;
                $scope.cdt.p_orange = lb_main_data.p_orange;

                //Remark NOV232022 By P.Sirintorn
                if(lb_main_data.eff_chance == 0){
                    $scope.cdt.eff_chance = "  N/A"
                }else{
                    $scope.cdt.eff_chance = lb_main_data.eff_chance;
                }
                //====================================================================

                showLoading($ionicLoading);
                $scope.getLinebalanceView($scope.cdt.id);
    //                        $scope.getLinebalanceView($scope.cdt.id);
                flag_timer = true;
                timerDataGrid();
//                $scope.cdt.style_data = data;
//                $scope.cdt.style = data.style;
//                $scope.cdt.total_sam = 0.000;
//                $scope.cdt.total_sam = (data.sam_gsd - 0).toFixed(3);

//                $scope.cdt.mode = '';
//                $scope.cdt.id = '';
//                $scope.cdt.total_sam = 0;
//                $scope.cdt.otp_target = 0;
//                $scope.cdt.takttime_plan = 0;
//                $scope.cdt.total_cycletime = '';
//                $scope.cdt.cycletime_max = '';
//                $scope.cdt.man = '';
//                $scope.cdt.percent_balance = '';
//                $scope.cdt.bn_position = '';
//                $scope.cdt.bn_employee = '';
//                $scope.cdt.bn_output = '';
//                $scope.cdt.bn_eff = '';
//                $scope.cdt.bn_otp = '';
//                $scope.cdt.last_update = '';
//                $scope.cdt.lbc_obj = [];
//                $scope.cdt.attatch_chart = '';
//                $scope.cdt.income = 0;
//                $scope.cdt.eff_plan = 0;
//                $scope.cdt.wip = wip;
//                $scope.cdt.p_red = 0;
//                $scope.cdt.p_green = 0;
//                $scope.cdt.p_yellow = 0;
//                $scope.cdt.p_orange = 0;
//                clearGraph();

//                $scope.getRevision(data.style);
                $scope.dialog_revision.hide();
            }

            $scope.onClickAddGsdHeader = function () {
                showLoading($ionicLoading);
                var request = {customer: $scope.cdt.customer, style: $scope.cdt_dl_style.style_keyword};
                addGsdHeader(request, function (data) {
                    console.log("addGsdHeader", data);
                    var msg_save = "";
                    if (data.errorcode == "OK") {
                        msg_save = "Save Success";
                        //                        $scope.dialog_gsd_header.hide();
                        $scope.getGsdHeaderByCust($scope.cdt.customer);
                        //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    } else {
                        msg_save = "Save No Success";
                        hideLoading($ionicLoading);
                        //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                    }
                    $ionicPopup.alert({
                        title: 'Status Save',
                        template: msg_save
                    });
                }, function () {
                    console.log("addGsdHeader", "ERROR");
                });
            };
            $scope.getCrdateFrLbMainByMax = function () {
                //                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var request = {line_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                getCrdateFrLbMainByMax(request, function (data) {
                    console.log("getCrdateFrLbMainByMax", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.last_update = data.data[0].create_datetime;
                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply();
                        }
                    } else {
//                                                $scope.cdt.factory_obj = {};
                    }

                }, function () {
                    hideLoading($ionicLoading);
                    console.log("getMaxCreateLbMain", "ERROR");
                });
            };
            $scope.getGsdHeaderByCdt = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var request = {customer: $scope.cdt.customer, style: style_data.style};
                getGsdHeaderByCdt(request, function (data) {
                    console.log("getGsdHeaderByCdt", data);
                    if (data.errorcode == "OK") {
                        var gsd_heder = data.data[0];
                        //                        if (gsd_heder.id){
                        $scope.cdt.gsd_header_id = gsd_heder.id;
                        $scope.addLbMain(gsd_heder.id);
                        //                        }
                    } else {
                        hideLoading($ionicLoading);
                        //                        $scope.cdt.factory_obj = {};
                    }

                }, function () {
                    hideLoading($ionicLoading);
                    console.log("getGsdHeaderByCdt", "ERROR");
                });
            };

            $scope.addLbMain = function () {

                showLoading($ionicLoading);
                //                line_id=?,gsd_header_id=?,takttime_plan=?,otp_target=?
                var request = {line_id: $scope.cdt.line_id
                    , takttime_plan: $scope.cdt.takttime_plan
                    , otp_target: $scope.cdt.otp_target
                    , style: $scope.cdt.style
                    , sam_gsd: $scope.cdt.total_sam
                    , customer_id: $scope.cdt.customer_id};
                addLbMain(request, function (data) {
                    console.log("addLbMain", data);
                    var msg_save = "";
                    if (data.errorcode == "OK") {
                        msg_save = "Save Data Lbmain Success";
                    } else {
                        msg_save = "Save Data Lbmain No Success";
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning Save',
                        template: msg_save
                    });
                    hideLoading($ionicLoading);
                    alertPopup.then(function (res) {
                        if (data.errorcode == "OK") {
                            console.log('Close Dialog Go to getLbMainByCdt');
                            $scope.getLbMainByCdt();
                        }

                    });
                }, function () {
                    console.log("addLbMain", "ERROR");
                });
            };
            $scope.getMaxSeqLbD = function (lb_main_id, workgroup_id, gcode_id) {
                showLoading($ionicLoading);
                var request = {lb_main_id: lb_main_id, workgroup_id: workgroup_id, gcode_id: gcode_id};
                getMaxSeqLbD(request, function (data) {
                    console.log("getMaxSeqLbD", data);
                    if (data.errorcode == "OK") {
                        var lb_detail = data.data[0];
                        var seq_max = (lb_detail.max ? lb_detail.max : 0);
                        //                        alert(seq_max);
                        //seq_max ใช้เช็คเงือนไข =0,>0 เพื่อปุ่มกดOK ค่าไม่เปลี่ยนแล้ว
                        $scope.cdt_dl_as.seq_max = seq_max - 0;
                        //Defaulst
                        $scope.cdt_dl_as.after_seq = seq_max - 0;
                        //                        $scope.cdt.factory_obj = data.data;
                    } else {
                        $scope.cdt_dl_as.seq_max = 0;
                        //Defaulst
                        $scope.cdt_dl_as.after_seq = 0;
                        //                        $scope.cdt.factory_obj = {};
                    }
                    hideLoading($ionicLoading);
                    //                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getMaxSeqLbD", "ERROR");
                    hideLoading($ionicLoading);
                });
            }
            $scope.getLinebalanceView = function (lb_main_id, upform_afsave) {
                var request = {lb_main_id: lb_main_id};
                getLinebalanceView(request, function (data) {
                    console.log("getLinebalanceView", data);
                    if (data.errorcode == "OK") {
                        //                        $scope.cdt.lbc_obj = data.data;
                        //                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        //                            $scope.$apply();
                        //                        }
                        //                        $scope.updateChartValue(data.data);
//  Check data size
//                        $ionicPopup.alert({
//                            title: 'data alert !',
//                            template: "<span style='color:#cc3300'>" + data.data.length + "</span>"
//                        });

                        for(i = 0; i < data.data.length; i++){
//                            data.data[i].table_color = '#ffcc99';
                            console.log("getLinebalanceView2", data);
                            if(data.data[i].cycletime > $scope.cdt.takttime_plan){
                                isUnderTakt = false;
                                break;
                            }else{
                                isUnderTakt = true;

                            }
                        }

// SET Table Color DEC082022
                        if(isUnderTakt == true){
                        for(i = 0; i < (data.data.length-1); i++){
                                data.data[i].table_color = $scope.setTableColor(data.data[i].cycletime);
                            }
                        }




////  Alert Check UnderTakt
//                            $ionicPopup.alert({
//                                title: 'data alert !',
//                                template: "<span style='color:#cc3300'>" + isUnderTakt + "</span>"
//                            });




                        if (upform_afsave) {
                            updateFormLbMain(data.data);
                        } else {
                            //เรียงข้อมูลใหม่และเอาข้อมูลที่เรียงแล้วไปsetลงกราฟ
                            //ถ้าเป็นการเข้ามาครั้งแรกไม่มีการกด หรือ มีการกดปุ่ม order ที่ไม่ใช่ปุ่ม C/T max-min
                            if ((!$scope.cdt.order_status) || ($scope.cdt.order_status && $scope.cdt.order_status == '0')) {
                                $scope.btnOrderDefault(data.data);
                            } else {
                                //set data object
                                $scope.cdt.lbc_obj = data.data;
                                //sort
                                //สถานะก่อน timer จะเข้ามา
                                $scope.cdt.order_status = ($scope.cdt.order_status == '1' ? '2' : '1');
                                $scope.btnOrderCtMaxMin();
                            }

                        }

                    } else {
                        $scope.onClickAdd();
                        //                        $scope.cdt.factory_obj = {};
                    }
//                    $scope.cdt.order_status = '0';
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getLinebalanceView", "ERROR");
                });
            };
            function timerDataGrid() {
                console.log("timerDataGrid");
                var time = 0;
                interval_data_grid = setInterval(myTimerDataGrid, 60000);
                function myTimerDataGrid() {

                    console.log('time', time++);
                    if (flag_timer) {
                        if ($scope.cdt.id) {
                            $scope.getLinebalanceView($scope.cdt.id);
                            $scope.getLbMainById();
//                        $scope.getLinebalanceView($scope.cdt.id);
                        } else {
                            clearTimerDataGrid();
                        }
                    }
                }

            }
            function clearTimerDataGrid() {
                flag_timer = false;
                clearInterval(interval_data_grid);
            }
            function updateFormLbMain(data_obj) {
                var lb_main_id = $scope.cdt.id;
                var total_cycletime = 0;
                var max_cycletime = 0;
                var man = data_obj.length;
                //index ของ reccord ที่ cycletime มากสุด
                var index_max_cycle = 0;
                var hasPack = 0;

                angular.forEach(data_obj, function (data, index) {
                    var cycle_time = (data.cycletime - 0).toFixed(3);
                    total_cycletime += (cycle_time - 0);
                    if (cycle_time > max_cycletime) {
                        max_cycletime = cycle_time;
                        index_max_cycle = index;
                    }
                    if(data.code.substr(0,4) == "PACK" || data.description.substr(0,4) == "pack" || data.description.substr(0,4) == "Pack"  || data.description.substr(0,2) == "QC" ){  //P.Sirintorn MAY292017
                        man = man -1;
                    }
                });
                //JAN042020 check max_cycletime and takttime_plan which one is more use that one.
                var balance = 0;

                //Remark uncheck max CT //FEB112024
//                if(max_cycletime > $scope.cdt.takttime_plan){
//                    balance = parseFloat(((total_cycletime * 100) / (max_cycletime * man)).toFixed(3));
//                }else{
//                    balance = parseFloat(((total_cycletime * 100) / ($scope.cdt.takttime_plan * man)).toFixed(3));
//                }
                balance = parseFloat(((total_cycletime * 100) / (max_cycletime * man)).toFixed(3));

                //เอา position_code ที่ cycletime มากสุดมา
                var position_code = data_obj[index_max_cycle].code;       //P.Sirintorn MAR112017
                //เอา emp_code ที่ cycletime มากสุดมา
                var emp_code = data_obj[index_max_cycle].employee;        //P.Sirintorn MAR112017
                var bn_output = parseFloat((60 / max_cycletime).toFixed(3));
                var bn_eff = parseFloat(((((bn_output * $scope.cdt.total_sam) / (man * 60)) * 100)).toFixed(3));
                var bn_otp = parseFloat(((($scope.cdt.takttime_plan / max_cycletime) * 100).toFixed(3)));

                // Remark NOV232022 when all cycle time under takttime
                //Calculate eff chance P.Sirintorn NOV232022
                var eff_chance = 0;
                if(isUnderTakt == true){
                    eff_chance = parseFloat(((($scope.cdt.takttime_plan-(total_cycletime/man))/(total_cycletime/man))*100).toFixed(3));
                }


                $scope.cdt.mode = 'update';
                $scope.cdt.total_cycletime = parseFloat(total_cycletime);
                $scope.cdt.cycletime_max = parseFloat(max_cycletime);
                $scope.cdt.man = parseFloat(man);
                $scope.cdt.percent_balance = parseFloat(balance);
                $scope.cdt.bn_output = parseFloat(bn_output);
                $scope.cdt.bn_eff = bn_eff;
                $scope.cdt.bn_otp = parseFloat(bn_otp);
                $scope.cdt.bn_employee = emp_code;
                $scope.cdt.bn_position = position_code;
                $scope.cdt.eff_chance = eff_chance;
                $scope.updateLbMainByCdt(data_obj);
            }
            $scope.updateLbMainByCdt = function (data_obj) {
                showLoading($ionicLoading);
                //                line_id=?,gsd_header_id=?,takttime_plan=?,otp_target=?
                var request = {
                    id: $scope.cdt.id
                    , total_cycletime: $scope.cdt.total_cycletime
                    , cycletime_max: $scope.cdt.cycletime_max
                    , man: $scope.cdt.man
                    , percent_balance: $scope.cdt.percent_balance
                    , bn_output: $scope.cdt.bn_output
                    , bn_eff: $scope.cdt.bn_eff
                    , bn_otp: $scope.cdt.bn_otp
                    , income: $scope.cdt.income
                    , eff_plan: $scope.cdt.eff_plan
                    , bn_position: $scope.cdt.bn_position
                    , bn_employee: $scope.cdt.bn_employee
                    , eff_chance: $scope.cdt.eff_chance
                };
                updateLbMainByCdt(request, function (data) {
                    console.log("updateLbMainByCdt", data);
                    //                    var msg_save = "";
                    //                    if (data.errorcode == "OK") {
                    //                        msg_save = "Save Success";
                    //                    } else {
                    //                        msg_save = "Save No Success";
                    //                    }
                    //                    var alertPopup = $ionicPopup.alert({
                    //                        title: 'Warning Save',
                    //                        template: msg_save
                    //                    });
                    //                    alertPopup.then(function (res) {
                    //                        console.log('Close Dialog Go to btnOrderDefault');
                    //                        if (data.errorcode == "OK") {
                    //เรียงข้อมูลใหม่และเอาข้อมูลที่เรียงแล้วไปsetลงกราฟ
                    //                            $scope.btnOrderDefault(data_obj);
                    $scope.getLbMainByCdt();
                    //                        }
                    //                    });
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("updateLbMainByCdt", "ERROR");
                });
            };
            $scope.onClickReset = function () {
                sum_time = 0.000;
                $scope.cdt_dl_lbc.count_time = "0.000";
                $scope.cdt_dl_lbc.cycletime = "0.000";
                clearInterval(interval_time);
                flag_stop = false;
            }
            $scope.clickStartStopT = function () {
                console.log('clickStartStopT', 'go to')
                if (!flag_stop) {
                    interval_time = setInterval(myTimer, 60);
                    function myTimer() {
                        sum_time += 0.00105;
                        $scope.cdt_dl_lbc.count_time = sum_time.toString().substr(0, 5);
                        //                        console.log('sum_time', sum_time);
                        $scope.$apply();
                    }
                    flag_stop = true;
                } else {

                    clearInterval(interval_time);
                    //alert($scope.cdt_dl_lbc.dividedby);
                    dividedby = $scope.cdt_dl_lbc.dividedby;
                    if(isNaN(dividedby)){
                        dividedby = 1;
                    }
                    $scope.cdt_dl_lbc.cycletime = (sum_time/dividedby).toString().substr(0, 5);
                    //SET StatusID
                    $scope.setSttIdByCcTTimer();
                    flag_stop = false;
                }

            }

            $scope.devidedTime = function () {
                console.log('devidedTime')
                if($scope_is_auto == 't'){
                    console.log('Is Auto True')
                    clearInterval(interval_time);
                    dividedby = $scope.cdt_dl_lbc.dividedby;
                    if(isNaN(dividedby)){
                        dividedby = 1;
                    }
                    sum_time = $scope.cdt_dl_lbc.cycletime;
                    $scope.cdt_dl_lbc.cycletime = (sum_time/dividedby).toString().substr(0, 5);
                    $scope.setSttIdByCcTTimer();
                }
            }

            $scope.setSttIdByCcTTimer = function () {
                //                alert('test');
                var takttime_plan = $scope.cdt.takttime_plan - 0;
                //SET status id
                if (($scope.cdt_dl_lbc.cycletime - 0) > (takttime_plan * (100 / 100))) {
                    //                        alert('1');
                    $scope.cdt_dl_lbc.status_id = '7';
                } else if ((takttime_plan * (85 / 100)) <= $scope.cdt_dl_lbc.cycletime && $scope.cdt_dl_lbc.cycletime <= (takttime_plan * (100 / 100))) {
                    //                        alert('2');
                    $scope.cdt_dl_lbc.status_id = '6';
                } else if (($scope.cdt_dl_lbc.cycletime - 0) < (takttime_plan * (85 / 100)) && ($scope.cdt_dl_lbc.cycletime - 0) > (takttime_plan * (50 / 100))) {
                    //                        alert('3');
                    $scope.cdt_dl_lbc.status_id = '5';
                }else{
                    $scope.cdt_dl_lbc.status_id = '8';
                }
                console.log('status_id!!', $scope.cdt_dl_lbc.status_id);
            }

            $scope.updateChartValue = function (data_obj) {
                $scope.labels = [];
                $scope.data = [];
                $scope.series = [];
                $scope.datasetOverride = [];
                var label_ar = [];
                var data_ar = [];
                var color_ar = [];
                var takttime_plan = $scope.cdt.takttime_plan - 0;
                var ar_over_cycle = [];
                var ar_lower_cycle =
                angular.forEach(data_obj, function (data, index) {
                    label_ar.push(data.code +' '+ data.employee);
                    data_ar.push((data.cycletime -0).toFixed(3));
                    ar_over_cycle.push(takttime_plan);

                    //                    alert(takttime_plan + ' : ' + (data.cycletime - 0));
                    if ((data.cycletime - 0) > (takttime_plan * (100 / 100))) {
                        //                        alert('1');
                        data.status_id = '7';
                        color_ar.push("#ff0000");
                    } else if ((takttime_plan * (85 / 100)) <= data.cycletime && data.cycletime <= (takttime_plan * (100 / 100))) {
                        //                        alert('2');
                        data.status_id = '6';
                        color_ar.push("#00ff00");
                    } else if ((data.cycletime - 0) < (takttime_plan * (85 / 100)) && (data.cycletime - 0) > (takttime_plan * (50 / 100))) {
                        //                        alert('3');
                        data.status_id = '5';
                        color_ar.push("#ffff00");
                    }else{
                        data.status_id = '8';
                        color_ar.push("#ff8000");
                    }

                });

//                function tableColor() {
////                 Remark NOV232022 when all cycle time under takttime
//                    var col = "";
//                    if ((data.cycletime - 0) > (takttime_plan * (100 / 100))) {
//                        //                        alert('1');
//                        data.status_id = '7';
//                        col = "#ff0000";
//                    } else if ((takttime_plan * (85 / 100)) <= data.cycletime && data.cycletime <= (takttime_plan * (100 / 100))) {
//                        //                        alert('2');
//                        data.status_id = '6';
//                        col = "#00ff00";
//                    } else if ((data.cycletime - 0) < (takttime_plan * (85 / 100)) && (data.cycletime - 0) > (takttime_plan * (50 / 100))) {
//                        //                        alert('3');
//                        data.status_id = '5';
//                        col = "#ffff00";
//                    }else{
//                        data.status_id = '8';
//                        col = "#ff8000";
//                    }
//                }


                $scope.labels = label_ar;
                $scope.data = [data_ar, ar_over_cycle];
                $scope.series = ['Series A', 'Series B'];
                //                console.log('color_ar', color_ar);
                //                $scope.color = color_ar;



                $scope.datasetOverride = [
                    {
                        label: "C/T",
                        borderWidth: 1,
                        backgroundColor: color_ar,
                        type: 'bar',
                        options: {

                            scales: {
                                xAxes: [{
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Test',
                                            steps: 10,
                                            stepValue: 5,
                                            max: 100,min:0
                                        }
                                    }],
                                yAxes: [{
                                        display: true,
                                        ticks: {
                                            beginAtZero: true,
                                            steps: 10,
                                            stepValue: 5,
                                            max: 100,min:0
                                        }
                                    }]
                            },

                            title: {
                                display: true,
                                text: 'Chart.js Line Chart - Legend'
                            }
                        }

                    },
                    {
                        label: "T/T",
                        borderWidth: 3,
                        borderColor: "rgba(230, 100, 50, 1)",
                        polar: true,
                        //                        hoverBackgroundColor: ['#FF4242','#2291ff'],
                        //                        backgroundColor: ['#ff6384'],
                        //                        hoverBackgroundColor: "rgba(255,99,132,0.4)",
                        //                        hoverBorderColor: "['#ff6384']",
                        type: 'line'
                        }
                ];
                //

                //                $scope.labels1 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
                //                $scope.data1 = [
                //                    [65, 59, 80, 81, 56, 55, 40],
                //                    [28, 48, 40, 19, 86, 27, 90]
                //                ];
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            }

            $scope.setTableColor = function (datact) {
                tt10 = $scope.cdt.takttime_plan * 0.1;
                tt15 = $scope.cdt.takttime_plan * 0.15;
                tt20 = $scope.cdt.takttime_plan * 0.2;

                if(datact <= tt10){
                    return '#00e9f5';
                }else if(datact <= tt15) {
                    return '#00ff00';
                }else if(datact <= tt20){
                    return '#ffff00'
                }else{
                    return '#FF0000'
                }

            }

            $scope.onClickIconStyle = function () {
                $scope.cdt_dl_style.style_keyword = '';
                $scope.dialog_style.show();
            };

            $scope.onClickRevision = function () {
//                $scope.cdt_dl_style.style_keyword = '';       //JUN022020
                $scope.getAllRevision();
                $scope.dialog_revision.show();
            };

            $scope.getAllRevision = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var request = {line_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                getRevision(request, function (data) {
                    console.log("getAllRevision ", data);

                    if (data.errorcode == "OK") {
                        $scope.lb_main_all_data.lb_main_obj = data.data;
                        $scope.cdt.mode = 'view';

                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getAllRevision ", "ERROR");
                });
            }

            $scope.onClickIconCust = function () {
                $scope.cdt_dl_gsd.keyword_cust = '';
                $scope.dialog_gsd_header.show();
            };

            $scope.onChangeIncome = function(){
                //$scope.cdt.takttime_plan = parseFloat(((60 / $scope.cdt.otp_target) - 0).toFixed(3));
                na = $scope.cdt.income;
                nb = (na/a)*b;
                nc = (na/a)*c;
                $scope.cdt.otp_target = parseFloat((nb-0).toFixed(3));
                //$scope.cdt.eff_plan = parseFloat((nc-0).toFixed(3));
                $scope.cdt.eff_plan = parseFloat((nc-0).toFixed(0));

                $scope.cdt.takttime_plan = parseFloat(((60 / $scope.cdt.otp_target) - 0).toFixed(3));

            };

            $scope.onClickRollBack = function(){
                $scope.cdt.income = a;
                $scope.cdt.otp_target = b;
                $scope.cdt.eff_plan = c;
                $scope.cdt.takttime_plan = parseFloat(((60 / $scope.cdt.otp_target) - 0).toFixed(3));

            }

            $scope.onClickPrint = function(id) {
//                if ($cordovaPrinter.isAvailable()) {
//                     $cordovaPrinter.print("http://www.google.co.th");
//                } else {
//                     alert("Printing is not available on device");
//                }

 //               alert(lineBalancceViewID);
                $scope.showPrintStd();
                $scope.dialog_print_standard.show();

            }

            $scope.print = function() {
                var col ='';
 //               alert(cdt_std_data.status_id+' '+cdt_std_data.status);

                if($cordovaPrinter.isAvailable()) {

                    if (cdt_std_data.status_id == 7) {
                        col = '#ff0000';
                    } else if (cdt_std_data.status_id == 6) {
                        col = '#00ff00';
                    } else if (cdt_std_data.status_id == 5) {
                        col = '#ffff00';
                    }else{
                        col = '#ff8000';
                    }

                    var page    = '';

                    page += '<html>';
                    page += '<head>';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=windows-874">';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=tis-620">';
                    page += '<title></title>';
                    page += '<style>';
                    page += '@page { size: A6 landscape;}';
                    page += 'body{font-size: 18px; margin: 0px; padding: 0px;}';
                    page += 'table{';
                    page += 'width: 100%;';
//                    page += 'height: 100%;';
                    page += 'border: 1px solid black;';
                    page += 'border-collapse: collapse;';
                    page += '}';
                    page += 'tr{';
                    page += 'border: 1px solid black;';
                    page += 'border-collapse: collapse;';
                    page += '}';
                    page += '</style>';
                    page += '</head>';
                    page += '<body>';
                    page += '<table>';
                    page += '<tr>';
                    page += '<td style="height: 100%px">&nbsp;<b><u>Sewing Standardized Work Sheet</u></b></td>';
                    page += '</tr>';
                    page += '<tr>';
                    page += '<td style="padding-left: 1px; padding-right: 1px; height: 100%px;">';
                    page += 'วันที่จับเวลา : '+cdt_std_data.lastupdate+' &nbsp; Line : '+cdt_std_data.line+' <br><br>';
                    page += 'Style : '+cdt_std_data.style+' &emsp; กลุ่มงาน : '+cdt_std_data.description+'<br><br>';
                    page += 'รหัสพนักงาน : '+cdt_std_data.employee+' &emsp; ชื่อพนักงาน : <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u><br><br>';
                    page += 'WIP: '+$scope.cdt_std.wip+' ตัว &emsp; Lot ส่ง : '+$scope.cdt_std.lott+' ตัว<br>';
                    page += 'ขั้นตอนเย็บ : '+cdt_std_data.step+'<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u><br><br>';
                    page += 'Takt Time : '+parseFloat(((60 / $scope.cdt.otp_target) - 0).toFixed(3))+' นาที &nbsp; &nbsp; &nbsp; Cycle Time : '+parseFloat((cdt_std_data.cycletime - 0).toFixed(3))+' นาที';
                    page += '</td>';
                    page += '</tr>';
                    page += '<tr>';
                    page += '<td align="center">';
                    page += ' สถานะ : <font color="'+col+'">'+cdt_std_data.status+'</font>';
                    page += '</td>';
                    page += '</tr>';
                    page += '</table>';
                    page += '</body>';
                    page += '</html>';

                    $cordovaPrinter.print(page);
                }else {
                    alert("Printing is not available on device");
                }
            }



            $scope.showPrintStd = function () {
                var lot = 1;
                console.log('LineBalancingViewID', lineBalancceViewID);
                $scope.cdt_std = {};
                var request = {id:lineBalancceViewID};
                getSewingStandard(request, function (data) {
                     console.log("getSewingStandard ", data);

                     if (data.errorcode == "OK") {
                     cdt_std_data = data.data[0];
                        $scope.cdt_std.id = cdt_std_data.id;
                        $scope.cdt_std.lastupdate = cdt_std_data.lastupdate;

                        $scope.cdt_std.line = cdt_std_data.line;
                        $scope.cdt_std.style = cdt_std_data.style;
                        $scope.cdt_std.description = cdt_std_data.description;
                        $scope.cdt_std.employee = cdt_std_data.employee;
  //                      $scope.cdt_std.employee_name = '';
                        $scope.cdt_std.wip = wip;
                        $scope.cdt_std.lott = lot;
                        $scope.cdt_std.step = cdt_std_data.step;

                        $scope.cdt_std.takttime_plan = parseFloat((cdt_std_data.takttime_plan - 0).toFixed(3));
                        $scope.cdt_std.cycletime = parseFloat((cdt_std_data.cycletime - 0).toFixed(3));
                     }
                     hideLoading($ionicLoading);
                 }, function () {
                     console.log("getSewingStandard ", "ERROR");
                 });
//
            };

            $scope.getLbMainById = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
                var request = {lb_main_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                getLbMainByCdt(request, function (data) {
                    console.log("getLbMainById ", data);

                    if (data.errorcode == "OK") {
                        var lb_main_data = data.data[0];
                        $scope.cdt.mode = 'update';
                        $scope.cdt.id = lb_main_data.id;
                        $scope.cdt.total_sam = (lb_main_data.sam_gsd - 0).toFixed(3);
                        $scope.cdt.otp_target = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                        b = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                        $scope.cdt.takttime_plan = parseFloat((lb_main_data.takttime_plan - 0).toFixed(3));
                        $scope.cdt.total_cycletime = parseFloat((lb_main_data.total_cycletime - 0).toFixed(3));
                        $scope.cdt.cycletime_max = parseFloat((lb_main_data.cycletime_max - 0).toFixed(3));
                        $scope.cdt.man = lb_main_data.man - 0;
                        $scope.cdt.percent_balance = parseFloat((lb_main_data.percent_balance - 0).toFixed(3));
                        $scope.cdt.bn_position = lb_main_data.bn_position;
                        $scope.cdt.bn_employee = lb_main_data.bn_employee;
                        $scope.cdt.bn_output = parseFloat((lb_main_data.bn_output - 0).toFixed(3));
                        $scope.cdt.bn_eff = parseFloat((lb_main_data.bn_eff - 0).toFixed(3));
                        $scope.cdt.bn_otp = parseFloat((lb_main_data.bn_otp - 0).toFixed(3));
                        $scope.cdt.last_update = lb_main_data.create_datetime;

                        //Remark SEP072018 By P.Sirintorn
                        $scope.cdt.p_red = lb_main_data.p_red;
                        $scope.cdt.p_green = lb_main_data.p_green;
                        $scope.cdt.p_yellow = lb_main_data.p_yellow;
                        $scope.cdt.p_orange = lb_main_data.p_orange;

                        //Remark OCT092017 By P.Sirintorn
//                            $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
//                            a = parseFloat((lb_main_data.income - 0).toFixed(2));
//                            $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
//                            c = parseFloat((lb_main_data.eff_plan - 0).toFixed(2));
                        $scope.cdt.income = parseFloat((lb_main_data.income - 0).toFixed(2));
                        a = parseFloat((lb_main_data.income - 0).toFixed(0));
                        $scope.cdt.eff_plan = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));
                        c = parseFloat((lb_main_data.eff_plan - 0).toFixed(0));

                        //Remark NOV232022 By P.Sirintorn
                        $scope.cdt.eff_chance = eff_chance;

                        $scope.cdt.showLoading($ionicLoading);
                        $scope.getLinebalanceView($scope.cdt.id);
                        flag_timer = true;
                        timerDataGrid();

                    }
                    hideLoading($ionicLoading);
                    //                    $scope.$apply();
                }, function () {
                    console.log("getLbMainById ", "ERROR");
                });
            }

            $scope.onClickSearch = function () {
            console.log("onClickSearch ");
                if(validateDateTime()){
                var st = startDateTime,
                    stformat = [st.getFullYear(),
                                st.getMonth()+1,
                               st.getDate()].join('-')+' '+
                              [st.getHours(),
                               st.getMinutes(),
                               st.getSeconds()].join(':');
                var ft = finishDateTime,
                    ftformat = [ft.getFullYear(),
                                ft.getMonth()+1,
                               ft.getDate()].join('-')+' '+
                              [ft.getHours(),
                               ft.getMinutes(),
                               ft.getSeconds()].join(':');

//                    $ionicPopup.alert({
//                        title: ' Start and Finish Datetime',
//                        template: $scope.cdt.id+" "+ $scope.cdt.line_id+" "+$scope.cdt.style_data.style+" "+st+ "<span style='color:#cc3300'>" + ft + "</span>"
//                    });
                $scope.deleteLbDetail4Median();
                $scope.getMaxStationId(stformat,ftformat);
//                showLoading($ionicLoading);
//
//                cdt.start_date = '';
//                cdt.finish_date = '';
                }
            }
//
            $scope.getMaxStationId = function (stformat,ftformat) {

                var station_id = 1;
                var request = {line_id: $scope.cdt.line_id, start_datetime: stformat, finish_datetime: ftformat};
                getMaxStationId(request, function (data) {

            //    showLoading($ionicLoading);
                console.log("getMaxStationId", data);
                if (data.errorcode == "OK") {

                    var max_id = data.data[0];
                    $scope.cdt.max_station_id = (max_id.max_stat_id ? max_id.max_stat_id : 0);

                    while(station_id <= $scope.cdt.max_station_id) {

                        showLoading($ionicLoading);
                        $scope.cdt.cycletime = 0;
                        $scope.cdt.employee = '';
                        $scope.cdt.status_id = 0;

                        var style_data = angular.fromJson($scope.cdt.style_data);
                        var request = {line_id : $scope.cdt.line_id,start_datetime: stformat, finish_datetime: ftformat, station_id: station_id, style: style_data.style};
                        getMedianData(request, function (data) {
                            console.log("getMedianData ", data);
                            pause(1000);
                            if (data.errorcode == "OK") {
                                pause(2500);
                                var median_data = data.data[0];
                                $scope.cdt.cycletime = median_data.cycletime;
                                $scope.cdt.employee = median_data.employee_id;
                                $scope.cdt.station_id = median_data.station_id;
                                pause(500);
                                $scope.stdStatusId();

                                var request = {station_id: $scope.cdt.station_id
                                 , lb_main_id:  $scope.cdt.id
                                 , employee: $scope.cdt.employee
                                 , cycletime: $scope.cdt.cycletime
                                 , status_id: $scope.cdt.status_id};
                                 addLbDetailMedian(request, function (data) {
                                     console.log("addLbDetailMedian", data);
                                     pause(2000);
                                     var msg_save = "";
                                     if (data.errorcode == "OK") {

                                         msg_save = "Save Data Median Success";

                                     } else {
                                         msg_save = "Save Data Median No Success";
                                     }
//                                     var alertPopup = $ionicPopup.alert({
//                                         title: 'Warning Save',
//                                         template: msg_save
//                                     });
//                                     alertPopup.then(function (res) {
//                                         if (data.errorcode == "OK") {
//                                             console.log('Close Dialog Save Median Go to getLbMainByCdt');
//                                            // $scope.getLbMainByCdt();
//                                         }
//
//                                     });
 //                                    $scope.cdt.roundcount = station_id;

                                 }, function () {
                                     console.log("addLbDetailMedian", "ERROR");
                                 });

                            }
                        }, function () {
                            console.log("getMedianData ", "ERROR");
                        });
                        //pause(1000);
                        station_id++;

                        }

                    }
                }, function () {
                    console.log("getMaxStationId", "ERROR");
                });

                 hideLoading($ionicLoading);
  //               $scope.dialog_auto_data_pickup.hide();
            }

            $scope.stdStatusId = function () {
                 //               alert('test');
                var takttime_plan = $scope.cdt.takttime_plan - 0;
                //SET status id
                if (($scope.cdt.cycletime - 0) > (takttime_plan * (100 / 100))) {
                    //                        alert('1');
                    $scope.cdt.status_id = '7';
                } else if ((takttime_plan * (85 / 100)) <= $scope.cdt.cycletime  && $scope.cdt.cycletime  <= (takttime_plan * (100 / 100))) {
                    //                        alert('2');
                    $scope.cdt.status_id = '6';
                } else if (($scope.cdt.cycletime  - 0) < (takttime_plan * (85 / 100)) && ($scope.cdt.cycletime- 0) > (takttime_plan * (50 / 100))) {
                    //                        alert('3');
                    $scope.cdt.status_id = '5';
                }else{
                    $scope.cdt.status_id = '8';
                }
                console.log('status_id!!', $scope.cdt.status_id);


            }

            $scope.deleteLbDetail4Median = function () {
                showLoading($ionicLoading);
                var request = {lbmain_id: $scope.cdt.id};
                deleteLbMain4Median(request, function (data) {
                    var msg_save = "";
                    console.log("deleteLbMain4Median", data);
                    pause(2000);
//                    if (data.errorcode == "OK") {
//                        msg_save = "Delete deleteLbMain4Median Success ";
//                    } else {
//                        msg_save = "Delete deleteLbMain4Median No Success ";
//                    }
//                    var alertPopup = $ionicPopup.alert({
//                        title: 'Warning Status Delete',
//                        template: msg_save
//                    });
//                    alertPopup.then(function (res) {
//                        if (data.errorcode == "OK") {
//                           // $scope.getLinebalanceView($scope.cdt.id, true);
//                        }
//                    });
//                    hideLoading($ionicLoading);
                }, function () {
                    console.log("deleteLbMain4Median", "ERROR");
                    hideLoading($ionicLoading);
                });
            }

            function pause(numberMillis) {
            console.log("pause ", "OK");
                var now = new Date();
                var exitTime = now.getTime() + numberMillis;
                while (true) {
                    now = new Date();
                    if (now.getTime() > exitTime)
                        return;
                }
            }

            function validateDateTime() {
                var msg = "";
                if (!$scope.cdt.start_date) {
                    msg += (msg == "" ? "" : ",") + "Start Date";
                }else{
                    startDateTime = $scope.cdt.start_date;
                }

                if (!$scope.cdt.finish_date) {
                    msg += (msg == "" ? "" : ",") + "Finish Date";
                }else{
                    finishDateTime = $scope.cdt.finish_date;
                }

                if(startDateTime > finishDateTime){
                    msg += (msg == "" ? "" : ",") + "Start datetime before Finish datetime.";
                }

                if (msg != "") {
                    $ionicPopup.alert({
                        title: 'Warning Start and Finish Datetime',
                        template: "Please input " + "<span style='color:#cc3300'>" + msg + "</span>"
                    });
                    //hideLoading($ionicLoading);
                    return false;
                } else {

                    return true;
                }
            }


        })
        .controller('Kaizen', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading, $cordovaPrinter) {
            var pictureSource;   // picture source
            var destinationType; // sets the format of returned value
            var kaizen_data;
            var before_img ;
            var after_img ;
            var style_dt;
            var step_dt;
            var line_dt;
            var date_dt = new Date();
            var this_dt = date_dt.getDate()+'/'+(date_dt.getMonth()+1)+'/'+date_dt.getFullYear();
            var corrective_a = '';
            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);
            // device APIs are available
            function onDeviceReady() {
                pictureSource = navigator.camera.PictureSourceType;
                destinationType = navigator.camera.DestinationType;
            }
            // Called if something bad happens.
            //
            function onFail(message) {
                alert('Failed because: ' + message);
            }
            // Called when a photo is successfully retrieved
            function onPhotoDataSuccessBf(imageData) {
                $scope.cdt.src_imgbefore = 'data:image/png;base64,'+imageData;
                localStorage.setItem('before_img', 'data:image/png;base64,' + imageData);
                $scope.cdt.loading_bf = false;
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
                console.log('$scope.cdt.src_imgbefore', $scope.cdt.src_imgbefore);
            }
            $scope.onClickTakePicBf = function () {
                $scope.cdt.loading_bf = true;
                navigator.camera.getPicture(onPhotoDataSuccessBf, onFail, {quality: 50,
                    destinationType: destinationType.DATA_URL});

            }

            function onPhotoDataSuccessAf(imageData) {
                $scope.cdt.src_imgafter = 'data:image/png;base64,'+imageData;
                localStorage.setItem('after_img', 'data:image/png;base64,' + imageData);
                $scope.cdt.loading_af = false;
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
                console.log('$scope.cdt.src_imgbeafter',$scope.cdt.src_imgbefore);
            }

            $scope.onClickTakePicAf = function () {
                $scope.cdt.loading_af = true;
                navigator.camera.getPicture(onPhotoDataSuccessAf, onFail, {quality: 50,
                    destinationType: destinationType.DATA_URL});
            }
//              }


            function init() {
                $scope.cdt = {};
                $scope.getGsdHeader();
                $scope.cdt_dl_gsd = {};
                $scope.cdt_dl_style = {};
                $scope.cdt_dl_prname = {};
                $scope.getFactory();
                factory_data = JSON.parse(localStorage.getItem("login_factory_data"));

                localStorage.setItem("before_img", '');
                localStorage.setItem("after_img", '');
                $scope.loading = false;
            }
            $scope.$on('$ionicView.enter', function () {
                init();
            });
            $scope.getFactory = function () {
                showLoading($ionicLoading);
                var request = {request: ''};
                getFactory(request, function (data) {
                    console.log("getFactory", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.factory_obj = data.data;

                        $scope.cdt.factory_data = factory_data;
                        $scope.cdt.factory_id = factory_data.id;
                        $scope.getLineBuilFac(factory_data.id);
                    } else {
                        $scope.cdt.factory_obj = [];
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getFactory", "ERROR");
                });
            }

            $scope.onChangeFactory = function () {
                //CLEAR FORM

                $scope.cdt.total_gsd_sam = 0;
                $scope.cdt.total_cycletime = 0;
                $scope.cdt.sam_detail_ratio = 0;
                $scope.cdt.ga_detail_obj = [];

                showLoading($ionicLoading);
                //clear ddl line
                $scope.cdt.line_id = '';
                $scope.cdt.line_data = {};
                $scope.cdt.lbf_obj = [];

                var factory_data = angular.fromJson($scope.cdt.factory_data);
                //set value default to another program
                localStorage.setItem("login_factory_data", JSON.stringify($scope.cdt.factory_data));
                $scope.cdt.factory_id = factory_data.id;
                $scope.getLineBuilFac(factory_data.id);
            };

            $scope.getLineBuilFac = function (factory_id) {
                var request = {factory_id: factory_id};
                getLineBuilFac(request, function (data) {
                    console.log("getLineBuilFac", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.lbf_obj = data.data;

                        $scope.$apply();
                    } else {
                        $scope.cdt.lbf_obj = [];
                    }
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getLineBuilFac", "ERROR");
                });
            }
            $scope.getPdtPlan = function (line_code) {
                showLoading($ionicLoading);
                var request = {line_code: line_code};
                getPdtPlan(request, function (data) {
                    console.log("getPdtPlan", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_style.style_obj = data.data;
                    } else {
                        $scope.cdt_dl_style.style_obj = [];
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getPdtPlan", "ERROR");
                });
            }
//            $scope.onClickIconCust = function () {
//                $scope.cdt_dl_gsd.keyword_cust = '';
//                $scope.dialog_gsd_header.show();
//            };

            $scope.onClickIconStyle = function () {
                $scope.cdt_dl_style.style_keyword = '';
                $scope.dialog_style.show();
            };

            $scope.onClickRowCust = function (data) {
                $scope.dialog_gsd_header.hide();
                $scope.cdt.customer = data.customer;
                $scope.getGsdHeaderByCust(data.customer);
            }
//            $scope.onClickRowStyle = function (data) {    //Remark By P.Sirintorn JUN212017
//                $scope.cdt.style = data.style;
//                $scope.cdt.total_sam = (data.total_sam - 0).toFixed(3);
//                $scope.cdt.gsd_header_id = data.id;
//                console.log('onClickRowStyle', data);
//                $scope.dialog_style.hide();
//                //                $scope.getGsdHeaderByCust(data.customer);
//            }

            $scope.onClickRowStyle = function (data) {
                //CLEAR FORM
                $scope.cdt.gsd_detail_id = '';
                $scope.cdt.gsd_detail_data = {};
                $scope.cdt.style = data.style;
                console.log('onClickRowStyle', data);
                style_dt = data.style;
                $scope.getCustomerByCode(data.style);
                $scope.getGsdDetailStepOnly(data.style);
                $scope.dialog_style.hide();
            }

            $scope.getMaxSeqKaizen = function (style) {
               showLoading($ionicLoading);
               var step_id =$scope.cdt.step_data.id;
 //              alert('step id '+step_id);
               var request = {step_id: step_id};
               getMaxSeqKaizen(request, function (data) {
                   console.log("getMaxSeqKaizen", data);
                   if (data.errorcode == "OK") {
                       $scope.cdt.seq_max = data.data[0].seq;
 //                      alert('seq '+ $scope.cdt.seq_max);
                   } else {
                       $scope.cdt.seq_max_obj = [];
                   }
                   if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                       $scope.$apply();
                   }
                   hideLoading($ionicLoading);
               }, function () {
                   console.log("getMaxSeqKaizen", "ERROR");
               });
           }

//            $scope.getCustomerByCode = function (style) { //Remark By P.Sirintorn JUN212017
//                showLoading($ionicLoading);
//                var request = {style: style};
//                getCustomerByCode(request, function (data) {
//                    console.log("getCustomerByCode", data);
//                    if (data.errorcode == "OK") {
//                        if (data.data && data.data.length > 0) {
//                            var cust_data = data.data[0];
//                            $scope.cdt.customer = cust_data.customer;
//                            $scope.cdt.customer_id = cust_data.id;
//                            //$scope.getGaMainByCdt();
//                        } else {
//                            $scope.cdt.customer = '';
//                            hideLoading($ionicLoading);
//                        }
//                    } else {
//                        $scope.cdt.customer = '';
//                        hideLoading($ionicLoading);
//                    }
//
//                }, function () {
//                    console.log("getCustomerByCode", "ERROR");
//                });
//            }

            $scope.getCustomerByCode = function (style) {
                showLoading($ionicLoading);
                var request = {style: style};
                getCustomerByCode(request, function (data) {
                    console.log("getCustomerByCode", data);
                    if (data.errorcode == "OK") {
                        if (data.data && data.data.length > 0) {
                            var cust_data = data.data[0];
                            $scope.cdt.customer = cust_data.customer;
                            $scope.cdt.customer_id = cust_data.id;
                        } else {
                            $scope.cdt.customer = '';
                        }
                    } else {
                        $scope.cdt.customer = '';
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getCustomerByCode", "ERROR");
                });
            }

            $scope.getGsdDetailStepOnly = function () {
                 showLoading($ionicLoading);

                $scope.cdt.step_obj = [];
                $scope.cdt.gsd_header_id = '';
                var request = {style: $scope.cdt.style};
                getGsdDetailStepOnly(request, function (data) {
                    console.log("getGsdDetailStepOnly", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.step_obj = data.data;
                        $scope.cdt.gsd_header_id = $scope.cdt.step_obj.gsd_header_id;
//                        alert('gsd_header_id = '+$scope.cdt.gsd_header_id);
//
//                        $scope.cdt.step_data = step_data;
//                        $scope.cdt.step_id = step_data.id;
                    } else {
                        $scope.cdt.step_obj = [];
                    }
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdDetailStepOnly", "ERROR");
                });
            }

            $scope.getGsdHeader = function () {
                showLoading($ionicLoading);
                var request = {request: ''};
                getGsdHeader(request, function (data) {
                    console.log("getGsdHeaderAll", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    } else {
                        $scope.cdt_dl_gsd.gsd_header_obj = [];
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeaderAll", "ERROR");
                });
            };


            $scope.onSelectLine = function () {
                //CLEAR FORM

//                $scope.cdt.ga_detail_obj = [];

                $scope.cdt.style = '';
                $scope.cdt.customer = '';
                $scope.cdt.customer_id = null;

                var line_data = angular.fromJson($scope.cdt.line_data);
                $scope.cdt.line_id = line_data.line_id;
                line_dt = line_data.code+"  "+line_data.line_name;
                $scope.getPdtPlan(line_data.code);

            }

//            $scope.getGsdDataByCdn = function () {
//                showLoading($ionicLoading);
//                var request = {line_id: $scope.cdt.line_id, gsd_header_id: $scope.cdt.gsd_header_id};
//                getGsdDataByCdn(request, function (data) {
//                    console.log("getGsdDataByCdn", data);
//                    if (data.errorcode == "OK") {
//                        var seq_max = data.data[0].seq_max;
//                        $scope.cdt.seq_max = data.data[0].seq_max;
//                    } else {
//                        $scope.cdt.seq_max = 0;
//                    }
//                    hideLoading($ionicLoading);
//                }, function () {
//                    console.log("getGsdDataByCdn", "ERROR");
//                });
//            }
            $ionicModal.fromTemplateUrl('templates/dialog_prname.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_prname = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_gsd_header.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_gsd_header = modal;
            });
            $ionicModal.fromTemplateUrl('templates/dialog_style.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_style = modal;
            });
            $scope.onClickPrname = function () {
                $scope.cdt_dl_prname.keyword_prname = '';
                $scope.dialog_prname.show();
            };
            $scope.onClickAddGsdHeader = function () {
                showLoading($ionicLoading);
                var request = {customer: $scope.cdt.customer, style: $scope.cdt_dl_style.style_keyword};
                addGsdHeader(request, function (data) {
                    console.log("addGsdHeader", data);
                    var msg_save = "";
                    if (data.errorcode == "OK") {
                        msg_save = "Save Success";
                        //                        $scope.dialog_gsd_header.hide();
                        $scope.getGsdHeaderByCust($scope.cdt.customer);
                        //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    } else {
                        msg_save = "Save No Success";
                        hideLoading($ionicLoading);
                        //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                    }
                    $ionicPopup.alert({
                        title: 'Status Save',
                        template: msg_save
                    });
                }, function () {
                    console.log("addGsdHeader", "ERROR");
                });
            };
            $scope.clickBtnUpBf = function () {
                var btn_upbf = document.getElementById("btn_upload_bf");
                btn_upbf.click();
                console.log('btn_upbf', btn_upbf);
                //                alert();
            }
            $scope.processFilesBefore = function (files) {
                //                alert('come testyyy');
                $scope.loading = true;
                $scope.cdt.src_imgbefore = [];
                var empid = localStorage.getItem("login_empid");
                angular.forEach(files, function (flowFile, i) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        $scope.cdt.src_imgbefore[i] = uri;
                        //                        $scope.cdt.piccode = getstrkeynowdatetime() + empid;
                        //                        $scope.cdt.pictype = "1";
                        localStorage.setItem('before_img', uri);
                        if (uri) {
                            $scope.loading = false;
                        }
                    };
                    fileReader.readAsDataURL(flowFile.file);
                });
            };
            //            $scope.testyyy = function (files) {
            //                alert('come testyyy');
            //            }
            $scope.processFilesAfter = function (files) {
                $scope.loading = true;
                $scope.cdt.src_imgafter = [];
                var empid = localStorage.getItem("login_empid");
                angular.forEach(files, function (flowFile, i) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        $scope.cdt.src_imgafter[i] = uri;
                        //                        $scope.condition_nist.piccode = getstrkeynowdatetime() + empid;
                        //                        $scope.condition_nist.pictype = "1";
                        localStorage.setItem('after_img', uri);
                        if (uri) {
                            $scope.loading = false;
                        }
                    };
                    fileReader.readAsDataURL(flowFile.file);
                });
            };
            $scope.addKaizen = function () {
                showLoading($ionicLoading);
                if (validateAddKaizen()) {        //JUN242017
                    var req = {seq: $scope.cdt.seq_max,
                        before_byte: localStorage.getItem("before_img"),
                        before_detail: $scope.cdt.before_detail,
                        after_byte: localStorage.getItem("after_img"),
                        after_detail: $scope.cdt.after_detail,
                        corrective_action: $scope.cdt.corrective_action,
                        gsd_header_id: $scope.gsd_header_id ,
                        line_id: $scope.cdt.line_id,
                        step_id: $scope.cdt.step_data.id
                    };
//                    alert("seq "+$scope.cdt.seq_max+" gsd_header_id "+$scope.cdt.customer_id+" line_id "+$scope.cdt.line_id+" step_id "+$scope.cdt.step_data.id)
                    //                    console.log('req', req);
                    addKaizen(req, function (data) {
                        console.log("addKaizen", data);
                        var msg_save = "";
                        if (data.errorcode == "OK") {
                            msg_save = "Save Success";
                            //                        $scope.dialog_gsd_header.hide();
                            init();
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                        } else {
                            msg_save = "Save No Success";
                            hideLoading($ionicLoading);
                            //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                        }
                        $ionicPopup.alert({
                            title: 'Status Save',
                            template: msg_save
                        });
                        hideLoading($ionicLoading);
                    }, function () {
                        console.log("addKaizen", "ERROR");
                    });

                }
            }
            function validateAddKaizen() {
                var msg_validate = "";
                if (!localStorage.getItem("before_img")) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Before Image";
                }
                if (!$scope.cdt.before_detail) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Before Details";
                }
                if (!localStorage.getItem("after_img")) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "After Image";
                }
                if (!$scope.cdt.after_detail) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "After Details";
                }
                if (!$scope.cdt.seq_max) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "SEQ";
                }

                if (!$scope.cdt.step_data) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Process Name";
                }
                //                alert(msg_validate);
                if (msg_validate != "") {
                    hideLoading($ionicLoading);
                    $ionicPopup.alert({
                        title: 'Warning Please enter !',
                        template: "<span style='color:#cc3300'>" + msg_validate + "</span>"
                    });
                    return false;
                } else {
                    return true;
                }
            }

            $scope.getGsdHeaderByCust = function (customer) {
                showLoading($ionicLoading);
                var request = {customer: customer};
                getGsdHeaderByCust(request, function (data) {
                    console.log("getGsdHeaderByCust ", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt_dl_style.style_obj = data.data;
                    } else {
                        $scope.cdt_dl_style.style_obj = [];
                    }
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeaderByCust ", "ERROR");
                });
            }

            $scope.onClickStep = function () {
                //$scope.cdt.step = '';
                var step_data = angular.fromJson($scope.cdt.step_data);
                $scope.gsd_header_id = step_data.gsd_header_id;
                $scope.step_id = step_data.id;
//                alert('style_data '+$scope.cdt.style+ ' step_id '+$scope.step_id)
                $scope.getKaizen($scope.cdt.style,$scope.step_id);
                step_dt = step_data.description;
                console.log("onClickStep ", step_data);
            }

            $scope.onClickClear = function () {
               onSelectBlobBf(null);
               onSelectBlobAf(null);
//               $scope.cdt.seq_max = '';
               $scope.cdt.before_detail = '';
               $scope.cdt.after_detail = '';
               $scope.cdt.corrective_action = '';
               $scope.getMaxSeqKaizen($scope.cdt.step_data.id);

                console.log("onClickClear ", '');

            }

            $scope.getKaizen = function (style,step_id) {
                showLoading($ionicLoading);
                var request = {style: style,step_id,step_id};
                getKaizen(request, function (data) {
                    console.log("getKaizen", data);
                    if (data.errorcode == "OK") {
                        kaizen_data = data.data[0];
                        before_img = data.data[0].before_byte;
                        after_img = data.data[0].after_byte;
                        var seq = data.data[0].seq;
                        onSelectBlobBf(before_img);
                        onSelectBlobAf(after_img);
                        $scope.cdt.seq_max = seq;
                        $scope.cdt.before_detail = data.data[0].before_detail;
                        $scope.cdt.after_detail = data.data[0].after_detail;
                        $scope.cdt.corrective_action = data.data[0].corrective_action;
                        corrective_a = $scope.cdt.corrective_action;
                        //$scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    } else {
                       onSelectBlobBf(null);
                       onSelectBlobAf(null);
 //                      $scope.cdt.seq_max = '';
                       $scope.cdt.before_detail = '';
                       $scope.cdt.after_detail = '';
                       $scope.cdt.corrective_action = '';
                       $scope.getMaxSeqKaizen($scope.cdt.step_data.id);
                       //$scope.cdt_dl_gsd.gsd_header_obj = data.data;
                    }

   //                 alert(kaizen_data.before_detail);
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getKaizen", "ERROR");
                });
            };

            function onSelectBlobBf(imageData) {
                $scope.cdt.src_imgbefore = imageData;
                localStorage.setItem('before_img', 'data:image/png;base64,' + imageData);
                $scope.cdt.loading_bf = false;
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
                console.log('$scope.cdt.src_imgbefore', $scope.cdt.src_imgbefore);
            }

             function onSelectBlobAf(imageData) {
                $scope.cdt.src_imgafter = imageData;
                localStorage.setItem('after_img', 'data:image/png;base64,' + imageData);
                $scope.cdt.loading_af = false;
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
                console.log('$scope.cdt.src_imgbeafter',$scope.cdt.src_imgbefore);
            }


            $scope.print = function() {
                if($cordovaPrinter.isAvailable()) {
                    var page    = '';

                    page += '<html>';
                    page += '<head>';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=windows-874">';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
                    page += '<meta http-equiv="Content-Type" content="text/html; charset=tis - 620">';
                    page += '<title>kaizen</title>';
                    page += '</head>';
                    page += '<body>';
                    page += '<table style="height: 18.8cm;width: 27.5cm;border: 1px solid black;border-collapse: collapse;">';

                    page += '     <tr>';
                    page += '     <td colspan="5" style="padding-left: 0.5cm;"> ';
                    page += '     	<table style="width: 27.5cm;font-size:10">';
                    page += '			<tr>';
                    page += '   				<td colspan="2" style="border: 1px solid black;">แบบฟอร์ม KAIZEN วันที่ : '+this_dt+' </td>';
                    page += '   				<td style="border: 1px solid black;width: 5.5cm">ผู้จัดทำ Kaizen : </td>';
                    page += '   				<td style="border: 1px solid black;width: 5.9cm"></td>';
                    page += '   		</tr>';
                    page += '    		<tr>';
                    page += '   			<td style="border: 1px solid black;width: 4.9cm">หัวข้อปรับปรุง : </td>';
                    page += '	   			<td style="border: 1px solid black;width: 10.1cm">'+style_dt+'   '+step_dt+'  </td>';
                    page += '   				<td style="border: 1px solid black;width: 5.5cm">พื้นที่ ที่ KAIZEN : </td>';
                    page += '   				<td style="border: 1px solid black;width: 5.9cm">'+line_dt+'</td>';
                    page += '    		</tr>';
                    page += '     	</table>';
                    page += '     </td>';
                    page += '	</tr>';
                    page += '     <tr>';
                    page += '      <td colspan="5" style="padding-left: 0.5cm;"> ';
                    page += '      <table style="font-size: 10">';
                    page += '      <tr>';
                    page += '      	<td style="width: 9.26cm">เลิก = ไม่ทำกิจกรรมนั้นๆแล้ว และไม่ทำอย่างอื่นทดแทน </td>';
                    page += '      	<td style="width: 9.26cm">ลด = ลดปริมาณ,จำนวนครั้งที่ทำกิจกรรมโดยไม่เปลี่ยนขั้นตอนที่เหลือ </td>';
                    page += '     	<td style="width: 9.26cm">เปลี่ยน = เปลี่ยนวิธีการทำงานจากเดิมโดยใช้วิธีอื่นแทนรูปก่อนทำ</td>';
                    page += '      </tr>';
                    page += '      </table>';
                    page += '      </td>';
                    page += '   </tr>';

                    page += '   <tr>';
                    page += '    	<td style ="padding-left: 0.5cm;">';
                    page += '    	<table style="height: 8.6cm;border: 1px solid black;width: 9cm;">';
                    page += '		<tr>';
                    page += '			<td style="height: 0.7cm;font-size: 10;text-align: center">รูปก่อนทำ </td>';
                    page += '		</tr>';
                    page += '  	   <tr>';
                    page += '			<td style="text-align: center;"><img src='+before_img+' height="250" width="300">   </td>';
                    page += '		</tr>';
                    page += '  	   <tr>';
                    page += '			<td style="height: 0.8cm;font-size: 10;">หมายเหตุ :การถ่ายรูปก่อนและหลังต้องถ่ายจากมุมเดียวกัน<br><!--ใส่ภาษาพม่าหลังbr--> </td>';
                    page += '		</tr>';
                    page += '   	   </table>';
                    page += '    	</td>';
                    page += '    	<td style="height: 8.6cm;">';
                    page += '   		  <table style="border: 1px solid black;border-collapse: collapse;height: 3.4cm;width: 7.9cm; font-size: 10">';
                    page += '    		<tr>';
                    page += '    		<td colspan="2">&#10003; หน้าข้อที่สอดคล้องกับหลักการ และแนวคิด KAIZEN<br><!--ภาษาพม่า--></td>';
                    page += '    		</tr>';
                    page += '    		<tr>';
                    page += '				<td colspan="2" style="border: 1px solid black;">เลือกแนวคิด KAIZEN (11แนวคิด)<br><!--ภาษาพม่า--></td>';
                    page += '			  </tr>';
                    page += '			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">1.ทำให้ไม่ผิดพลาด/ทำให้ถูกต้องเสมอ(โดยตรวจสอบผลลัพธ์และต้องมีหน้างานให้ตรวจ)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '				<td colspan="2" style="border: 1px solid black;">แนวคิดทั่วไป<!--ภาษาพม่า--></td>';
                    page += '			  </tr>';
                    page += '			  <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;height: 0.4cm;">1.ทำให้ผิดพลาดยาก</td>';
                    page += '  			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">2.ทำให้ไม่อันตราย/ปลอดภัย</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">3.ทำให้เร็วขึ้น,สะดวกขึ้น</td>';
                    page += '  			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">4.ทำให้มองเห็น,ไม่ต้องหา</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">5.ทำให้แยกสี,ทราบจำนวน,ทราบตำแหน่ง</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">6.ทำให้กลับมาใช้ได้อีกครั้ง,ไม่สิ้นเปลือง</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">7.ทำให้เป็นหนึ่งเดียวเสร็จในครั้งเดียว</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">8.ทำให้มาก่อน มาก่อน</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">9.ทำให้เป็นประจำ</td>';
                    page += '   			</tr>';
                    page += '   			 <tr>';
                    page += '  			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="border: 1px solid black;">10.ทำไว้ล่วงหน้า</td>';
                    page += '   			</tr>';
                    page += '			</table>';
                    page += '    	</td>';
                    page += '    	<td style="width: 9cm;border-right: 1px solid black;">';
                    page += '    		<table style="height: 8.6cm;border: 1px solid black;width: 9cm;">';
                    page += '		<tr>';
                    page += '			<td style="height: 0.7cm;font-size: 10;text-align: center">รปหลังทำ </td>';
                    page += '		</tr>';
                    page += '  	   	<tr>';
                    page += '			<td style="text-align: center;"> <img src='+after_img+' height="250" width="300">   </td>';
                    page += '		</tr>';
                    page += ' 	   <tr>';
                    page += '			<td style="height: 0.8cm"> </td>';
                    page += '		</tr>';
                    page += '   	   </table>';
                    page += '    	</td>';
                    page += '    </tr>';

                    page += '     <tr>';
                    page += '      <td style="height: 3.4cm; border: 1px solid black;font-size: 10;text-align: left;vertical-align: top;padding: 0.25cm">ก่อนทำ : '+kaizen_data.before_detail+'</td>';
                    page += '      <td width="210" style="height: 3.4cm;width: 6.6cm;">';
                    page += '      	<table style="border: 1px solid black;border-collapse: collapse;height: 3.4cm;width: 7.9cm; font-size: 10;">';
                    page += '      		<tr>';
                    page += '      			<td colspan="2" style="width: 0.4cm;height: 0.4cm;border: 1px solid black;">&#10003;หน้าข้อที่เลือกเกี่ยวกับไคเซ็นที่ทำ</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">1.Quality (คุณภาพ)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">2.Cost (ต้นทุน)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">3.Delivery(การส่งมอบ)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">4.Safety(ความปลอดภัย)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">5.Moral(ขวัญและกำลังใจ)</td>';
                    page += '   			</tr>';
                    page += '   			<tr>';
                    page += '   			<td style="width: 0.4cm;height: 0.4cm;border: 1px solid black;"><input type="checkbox"></td>';
                    page += '   			<td style="width: 6.2cm;height: 0.4cm;border: 1px solid black;">6.Enviroment(สภาพแวดล้อม)</td>';
                    page += '   			</tr>';
                    page += '      	</table>';
                    page += '      </td>';
                    page += '      <td style="border:1px solid black; height: 3.4cm; border: 1px solid black; width: 9.8cm;font-size: 10;text-align: left;vertical-align: top;padding: 0.25cm">หลังทำ : '+kaizen_data.after_detail+'</td>';
                    page += '    </tr>';
                    page += '     <tr>';
                    page += '     <td colspan="5" style="border:1px solid black; padding-left: 0.5cm; font-size: 10;"><b>มูลค่าที่ลดได้ : </b>'+corrective_a+'</td>';
                    page += '     </tr>';
                    page += '     <tr>';
                    page += '      <td colspan="5" style="height: 2.2cm;padding-left: 0.5cm; font-size: 9;line-height: 0.5cm;"><b><u>การคำนวณผลลัพธ์ที่เป็นตัวเงิน</u></b> <b><u>ค่ามาตรฐาน</u></b> 1.รายรับต่อนาทีแรงงาน = 1.959 บาท&emsp;2.กระดาษ A4 ถ่าย(80แกรม) แผ่นละ0.17บาท&emsp;3.กระดาษ A4 พิมพ์(70 แกรม) แผ่นละ0.14 บาท&emsp;4.กระดาษ F14 แผ่นละ 0.22 บาท <br>';
                    page += '        5.ค่าถ่ายเอกสาร แผ่นละ 0.33 บาท&emsp;6.หมึกพิมพ์ ขึ้นอยู่กับเครื่องพิมพ์ 1 แผ่น = ราคาหมึก 1 ตลับ/จำนวนแผ่นที่พิมพ์ได้จากหมึก 1 ตลับ<br>';
                    page += '        <b><u>ตัวอย่างการคำนวณHard Saving สูตรการคิด</u></b> 1.มูลค่าที่ลดได้(กระดาษ)=จำนวนกระดาษที่ลดได้หลังไคเซ็น x ราคากระดาษ&emsp;2.มูลค่าที่ลดได้(สิ่งประดิษฐ์)=มูลค่าสิ่งของกรณีซื้อจากท้องตลาด-มูลค่าสิ่งของที่ประดิษฐ์เอง<br>';
                    page += '        <b><u>ตัวอย่างการคำนวณ Potential Saving สูตรการคิด</u></b> 1.โอกาสเพิ่มรายได้ = จำนวนOrderหลังการแก้ไข x นาทีที่ลดได้ x รายรับต่อนาทีแรงงาน&emsp;2.นาทีที่ลดได้ = เวลาก่อนไคเซ็น-เวลาหลังไคเซ็น </td>';
                    page += '    </tr>';
                    page += '</table>';
                    page += '</body>';
                    page += '</html>';

                    $cordovaPrinter.print(page);
                }else {
                    alert("Printing is not available on device");
                }
            }

        })
        .controller('GsdAnalysis', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
                        var next_idx_group = -1;
                        var next_idx_step = -1;
                        var flag_stop = false;
                        var interval_time;
                        var sum_time = 0.000;
                        var itv_ga_detail = null;
                        var diff = 0.000;
                        var takttime_plan = 0;
                        var max_rev = 0;

                        //Default value location
                        var factory_data = null;
                        function init() {
                            $scope.cdt = {};
            //                $scope.cdt.customer = '1';
            //                $scope.cdt.style = '1';
            //                $scope.cdt.factory_id = '1';
                            $scope.cdt_dl_gsd = {};
                            $scope.cdt_dl_style = {};
                            $scope.cdt_dl_prname = {};
                            $scope.ga_main_all_data = {};
                            $scope.getGsdHeader();

                            $scope.getFactory();
                            factory_data = JSON.parse(localStorage.getItem("login_factory_data"));

                        }

            //            var timer = 0;
                        function setItvGaDetail() {
                            itv_ga_detail = setInterval(gaDetailTimer, 60000);
                        }

                        function gaDetailTimer() {
                            console.log('gaDetailTimer!!');
                            $scope.getGaDetail($scope.cdt.ga_main_id);
                            $scope.getGaMainById();
            //                console.log('timer', timer++);
            //                var d = new Date();
            //                document.getElementById("demo").innerHTML = d.toLocaleTimeString();
                        }
                        function onClickClear() {
                            clearInterval(itv_ga_detail);
                        }
                        $scope.getFactory = function () {
                            showLoading($ionicLoading);
                            var request = {request: ''};
                            getFactory(request, function (data) {
                                console.log("getFactory", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt.factory_obj = data.data;

                                    $scope.cdt.factory_data = factory_data;
                                    $scope.cdt.factory_id = factory_data.id;
                                    $scope.getLineBuilFac(factory_data.id);
                                } else {
                                    $scope.cdt.factory_obj = [];
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getFactory", "ERROR");
                            });
                        }
                        $scope.onChangeFactory = function () {
                            //CLEAR FORM

                            $scope.cdt.total_gsd_sam = 0;
                            $scope.cdt.total_cycletime = 0;
                            $scope.cdt.sam_detail_ratio = 0;
                            $scope.cdt.ga_detail_obj = [];

                            showLoading($ionicLoading);
                            //clear ddl line
                            $scope.cdt.line_id = '';
                            $scope.cdt.line_data = {};
                            $scope.cdt.lbf_obj = [];

                            var factory_data = angular.fromJson($scope.cdt.factory_data);
                            //set value default to another program
                            localStorage.setItem("login_factory_data", JSON.stringify($scope.cdt.factory_data));
                            $scope.cdt.factory_id = factory_data.id;
                            $scope.getLineBuilFac(factory_data.id);
                        };
                        $scope.getGsdHeader = function () {
                            showLoading($ionicLoading);
                            var request = {request: ''};
                            getGsdHeader(request, function (data) {
                                console.log("getGsdHeaderAll", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                                } else {
                                    $scope.cdt_dl_gsd.gsd_header_obj = [];
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdHeaderAll", "ERROR");
                            });
                        };
                        $scope.onClickIconCust = function () {
                            $scope.cdt_dl_gsd.keyword_cust = '';
                            $scope.dialog_gsd_header.show();
                        };
                        $scope.onClickIconStyle = function () {
                            $scope.cdt_dl_style.style_keyword = '';
                            $scope.dialog_style.show();
                        };
                        $scope.$on('$ionicView.enter', function () {
                            init();
                            $scope.scrollbarConfig = {
                                theme: 'minimal-dark',
                                scrollInertia: 500
                            }
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_prname.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_prname = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_gsd_header.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_gsd_header = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_style.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_style = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_content_timer.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_content_timer = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_auto_data_4tabgsd_pickup.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_auto_data_4tabgsd_pickup = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/dialog_gsd_revision.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.dialog_gsd_revision = modal;
                        });

//Remark APR172020
//                        $scope.onClickNextGroup = function () {
//                            //CHECKก่อนว่าnext_idxไม่เกินlength
//                            (next_idx_group + 1 > $scope.cdt_dl_timer.group_obj.length ? next_idx_group = 0 : (next_idx_group == -1 ? next_idx_group = 0 : next_idx_group++));
//                            $scope.cdt_dl_timer.group_data = $scope.cdt_dl_timer.group_obj[next_idx_group];
//                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
//                                $scope.$apply();
//                                $scope.onChangeGroup();
//                            } else {
//                                $scope.onChangeGroup();
//                            }
//
//                        };
//                        $scope.onClickNextStep = function () {
//                            console.log('next_idx_step pr', next_idx_step);
//                            //CHECKก่อนว่าnext_idxไม่เกินlength
//                            (next_idx_step + 1 > $scope.cdt_dl_timer.step_obj.length ? next_idx_step = 0 : (next_idx_step == -1 ? next_idx_step = 0 : next_idx_step++));
//                            console.log('next_idx_step af', next_idx_step);
//                            $scope.cdt_dl_timer.step_data = $scope.cdt_dl_timer.step_obj[next_idx_step];
//                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
//                                $scope.$apply();
//                                $scope.onChangeStep();
//                            } else {
//                                $scope.onChangeStep();
//                            }
//                        };
//                        $scope.onChangeGroup = function () {
//
//                            var group_data = angular.fromJson($scope.cdt_dl_timer.group_data);
//                            if (group_data) {
//                                console.log('group_data', group_data);
//                                next_idx_group = group_data.index - 0;
//                                var step_ar = [];
//                                var idx = 0;
//                                angular.forEach($scope.cdt_dl_timer.gsd_detail_obj, function (data_for, index) {
//                                    if (data_for.group_id && data_for.group_id == group_data.id) {
//                                        data_for.index = idx;
//                                        step_ar.push(data_for);
//                                        idx++;
//                                    }
//                                });
//                                $scope.cdt_dl_timer.step_obj = step_ar;
//                            }
//                        };
//                        $scope.onChangeStep = function () {
//                            var step_data = angular.fromJson($scope.cdt_dl_timer.step_data);
//                            if (step_data) {
//                                console.log('step_data', step_data);
//                                next_idx_step = step_data.index - 0;
//                                $scope.cdt_dl_timer.gsd_sam = (step_data.sam_gsd - 0).toFixed(3);
//                            } else {
//                                $scope.cdt_dl_timer.gsd_sam = 0;
//                            }
//                        };

                        $scope.onChangeGsd = function () {
                            var step_data = angular.fromJson($scope.cdt_dl_timer.group_data);
                            if (step_data) {
                                console.log('step_data', step_data);
                                next_idx_step = step_data.index - 0;
                                $scope.cdt_dl_timer.sam = (step_data.sam - 0).toFixed(3);
                                $scope.cdt_dl_timer.code = step_data.code;
                                $scope.cdt_dl_timer.gsd_name = step_data.gsd_name;
                            } else {
                                $scope.cdt_dl_timer.gsd_sam = 0;
                            }

                        };
                        

                        $scope.onCloseDlCtLbc = function () {
            //                $scope.onClickReset();
                            setItvGaDetail();
                            $scope.dialog_content_timer.hide();
                        };

                        $scope.onClickBtnTimer = function () {
                            onClickClear();
                            sum_time = 0.000;
                            next_idx_group = -1;
                            next_idx_step = -1;
                            $scope.cdt_step = {};
                            $scope.cdt_dl_group = {};
//                            $scope.getGsdDetailsToGroup();    //Remark APR032020
                            $scope.getGsd();
                            $scope.cdt_dl_timer = {};
                            $scope.cdt_dl_timer.count_time = "0.000";
                            $scope.cdt_dl_timer.ga_main_id = $scope.cdt.ga_main_id;

                            $scope.dialog_content_timer.show();

                        };
            //            $scope.onClickReset = function () {
            //                sum_time = 0.000;
            //                $scope.cdt_dl_lbc.count_time = "0.000";
            //                $scope.cdt_dl_lbc.cycletime = "0.000";
            //                clearInterval(interval_time);
            //                flag_stop = false;
            //            };
                        $scope.setSttIdByCcTTimer = function () {
            //                alert('test');
                            takttime_plan = $scope.cdt.takttime_plan - 0;
                            //SET status id
                            if (($scope.cdt_dl_timer.cycletime - 0) > (takttime_plan * (100 / 100))) {
            //                        alert('1');
                                $scope.cdt_dl_timer.status_id = '7';
                            } else if ((takttime_plan * (85 / 100)) <= $scope.cdt_dl_timer.cycletime && $scope.cdt_dl_timer.cycletime <= (takttime_plan * (100 / 100))) {
            //                        alert('2');
                                $scope.cdt_dl_timer.status_id = '6';
                            } else if (($scope.cdt_dl_timer.cycletime - 0) < (takttime_plan * (85 / 100))) {
            //                        alert('3');
                                $scope.cdt_dl_timer.status_id = '5';
                            }
                            console.log('status_id!!', $scope.cdt_dl_timer.status_id);
                        }
                        $scope.onClickRowCust = function (data) {
                            //CLEAR FORM
                            $scope.cdt.style = '';
                            $scope.cdt.total_sam = 0;
                            $scope.cdt.factory_id = '';
                            $scope.cdt.factory_data = {};
                            $scope.cdt.line_id = '';
                            $scope.cdt.line_data = {};
                            $scope.cdt.total_gsd_sam = 0;
                            $scope.cdt.total_cycletime = 0;
                            $scope.cdt.sam_detail_ratio = 0;
                            $scope.cdt.ga_detail_obj = [];

                            $scope.dialog_gsd_header.hide();
                            $scope.cdt.customer = data.customer;
            //                $scope.getGsdHeaderByCust(data.customer);
                            $scope.getGaMainData();
                        }

                        $scope.getCustomerByCode = function (style) {
                            showLoading($ionicLoading);
                            var request = {style: style};
                            getCustomerByCode(request, function (data) {
                                console.log("getCustomerByCode", data);
                                if (data.errorcode == "OK") {
                                    if (data.data && data.data.length > 0) {
                                        var cust_data = data.data[0];
                                        $scope.cdt.customer = cust_data.customer;
                                        $scope.cdt.customer_id = cust_data.id;
                                        $scope.getGaMainByCdt();
                                    } else {
                                        $scope.cdt.customer = '';
                                        hideLoading($ionicLoading);
                                    }
                                } else {
                                    $scope.cdt.customer = '';
                                    hideLoading($ionicLoading);
                                }

                            }, function () {
                                console.log("getCustomerByCode", "ERROR");
                            });
                        }
                        $scope.onClickRowStyle = function (data) {
                            //CLEAR FORM
            //                $scope.cdt.factory_id = '';
            //                $scope.cdt.factory_data = {};
            //                $scope.cdt.line_id = '';
            //                $scope.cdt.line_data = {};
            //                $scope.cdt.total_gsd_sam = 0;
            //                $scope.cdt.total_cycletime = 0;
            //                $scope.cdt.sam_detail_ratio = 0;
            //                $scope.cdt.ga_detail_obj = [];
                            $scope.cdt.customer = '';
                            $scope.cdt.customer_id = null;

                            $scope.cdt.style = data.style;
            //
                            $scope.cdt.sam_gsd = (data.sam_gsd - 0).toFixed(3);
            //                $scope.cdt.total_sam = (data.total_sam - 0).toFixed(3);
            //                $scope.cdt.gsd_header_id = data.id;

                            console.log('onClickRowStyle', data);

                            $scope.getCustomerByCode(data.style);
                            $scope.dialog_style.hide();
            //                $scope.getGsdHeaderByCust(data.customer);
                        }
                        $scope.getGaMainByCdt = function () {
                            showLoading($ionicLoading);
            //                 sam_gsd: $scope.cdt.sam_gsd
                            var request = {
                                line_id: $scope.cdt.line_id,
                                style: $scope.cdt.style,
                                customer: $scope.cdt.customer,
                            };
                            getGaMainByCdt(request, function (data) {
                                console.log("getGaMainByCdt ", data);
                                if (data.errorcode == "OK") {
                                    var data_obj = data.data[0];
                                    max_rev = data_obj.revision;
                                    $scope.cdt.ga_main_id = data_obj.id;
//                                    alert("id "+$scope.cdt.ga_main_id+"  iid "+data_obj.id);
                                    $scope.getGaDetail(data_obj.id);
                                    $scope.cdt.total_gsd_sam = parseFloat((data_obj.sam_gsd - 0).toFixed(3));
                                    $scope.cdt.total_cycletime = parseFloat((data_obj.total_cycletime - 0).toFixed(3));
                                    $scope.cdt.sam_header_ratio = parseFloat((data_obj.sam_header_ratio - 0).toFixed(3));
                                    $scope.cdt.revision = (data_obj.revision -0); //Remark By P.Sirintorn JUN202017
                                    $scope.cdt.last_update = data_obj.create_datetime;


                                    setItvGaDetail();
                                } else {
                                    $scope.addGaMain();
                                }
            //                    hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGaMainByCdt ", "ERROR");
                            });
                        }
                        $scope.getGaDetail = function (ga_main_id) {
            //                showLoading($ionicLoading);
            //                 sam_gsd: $scope.cdt.sam_gsd
                            var request = {
                                ga_main_id: ga_main_id
                            };
            //                var request = {customer: customer};
                            getGaDetailSL(request, function (data) {
                                console.log("getGaDetailSL ", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt.ga_detail_obj = data.data;
            //                        $scope.getGsdHeaderByCdt();
                                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                        $scope.$apply();
                                    }
                                } else {
                                    $scope.cdt.total_gsd_sam = 0;
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGaDetailSL ", "ERROR");
                            });
                        };
                        $scope.addGaMain = function (customer) {
            //                showLoading($ionicLoading);
            //                 sam_gsd: $scope.cdt.sam_gsd
                            var request = {
                                line_id: $scope.cdt.line_id,
                                sam_gsd: $scope.cdt.sam_gsd,
                                customer_id: $scope.cdt.customer_id,
                                style: $scope.cdt.style
                            };
            //                var request = {customer: customer};
                            addGaMain(request, function (data) {
                                console.log("addGaMain ", data);
                                if (data.errorcode == "OK") {
                                    $scope.getGaMainToId();
                                    $scope.getGsdHeaderByCdt();
                                } else {
                                    $scope.cdt.total_gsd_sam = 0;
                                    hideLoading($ionicLoading);
                                }
            //                    hideLoading($ionicLoading);
                            }, function () {
                                console.log("addGaMain ", "ERROR");
                            });
                        }
                        $scope.getGaMainToId = function () {
                            showLoading($ionicLoading);
                            var request = {
                                line_id: $scope.cdt.line_id,
                                style: $scope.cdt.style,
                                customer: $scope.cdt.customer,
                            };
                            getGaMainByCdt(request, function (data) {
                                console.log("getGaMainToId ", data);
                                if (data.errorcode == "OK") {
                                    var data_obj = data.data[0];
                                    $scope.cdt.ga_main_id = data_obj.id;
                                    setItvGaDetail();
                                } else {
                                    onClickClear();
                                    $scope.cdt.ga_main_id = null;
                                }
                                $scope.getGaMainByCdt();// Remark By P.Sirintorn JUN192017
                                //$scope.getGaDetail();       // Remark By P.Sirintorn JUN192017
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGaMainByCdt ", "ERROR");
                            });

                        }
                        $scope.getGsdHeaderByCdt = function (customer) {
            //                showLoading($ionicLoading);
            //                 sam_gsd: $scope.cdt.sam_gsd
                            var request = {
                                style: $scope.cdt.style,
                                customer: $scope.cdt.customer
                            };
            //                var request = {customer: customer};
                            getGsdHeaderByCdt(request, function (data) {
                                console.log("getGsdHeaderByCdt ", data);
                                if (data.errorcode == "OK") {
                                    var data_obj = data.data[0];
                                    $scope.cdt.total_gsd_sam = parseFloat((data_obj.total_sam - 0).toFixed(3));   // Remark By P.Sirintorn JUN192017
                                } else {
                                    $scope.cdt.total_gsd_sam = 0;
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdHeaderByCdt ", "ERROR");
                            });
                        }
                        $scope.getGsdHeaderByCust = function (customer) {
                            showLoading($ionicLoading);
                            var request = {customer: customer};
                            getGsdHeaderByCust(request, function (data) {
                                console.log("getGsdHeaderByCust ", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt_dl_style.style_obj = data.data;
                                } else {
                                    $scope.cdt_dl_style.style_obj = [];
                                }
                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdHeaderByCust ", "ERROR");
                            });

                            $scope.onClickAddGsdHeader = function () {
                                showLoading($ionicLoading);
                                var request = {customer: $scope.cdt.customer, style: $scope.cdt_dl_style.style_keyword};
                                addGsdHeader(request, function (data) {
                                    console.log("addGsdHeader", data);
                                    var msg_save = "";
                                    if (data.errorcode == "OK") {
                                        msg_save = "Save Success";
                                        //                        $scope.dialog_gsd_header.hide();
                                        $scope.getGsdHeaderByCust($scope.cdt.customer);
                                        //                        $scope.cdt_dl_gsd.gsd_header_obj = data.data;
                                    } else {
                                        msg_save = "Save No Success";
                                        hideLoading($ionicLoading);
                                        //                        $scope.cdt_dl_gsd.gsd_header_obj = {};
                                    }
                                    $ionicPopup.alert({
                                        title: 'Status Save',
                                        template: msg_save
                                    });
                                }, function () {
                                    console.log("addGsdHeader", "ERROR");
                                });
                            };
                        }
                        $scope.getLineBuilFac = function (factory_id) {
                            var request = {factory_id: factory_id};
                            getLineBuilFac(request, function (data) {
                                console.log("getLineBuilFac", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt.lbf_obj = data.data;
                                    $scope.$apply();
                                } else {
                                    $scope.cdt.lbf_obj = [];
                                }
                                $scope.$apply();
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getLineBuilFac", "ERROR");
                            });
                        }
                        $scope.onSelectLine = function () {
                            //CLEAR FORM
                            $scope.cdt.total_gsd_sam = '';
                            $scope.cdt.total_cycletime = '';
                            $scope.cdt.sam_detail_ratio = '';
                            $scope.cdt.ga_detail_obj = [];

                            $scope.cdt.style = '';
                            $scope.cdt.customer = '';
                            $scope.cdt.customer_id = null;

                            var line_data = angular.fromJson($scope.cdt.line_data);
                            $scope.cdt.line_id = line_data.line_id;
                            $scope.getPdtPlan(line_data.code);
                            $scope.is_auto = line_data.is_auto;

                        }
                        $scope.getPdtPlan = function (line_code) {
                            showLoading($ionicLoading);
                            var request = {line_code: line_code};
                            getPdtPlan(request, function (data) {
                                console.log("getPdtPlan", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt_dl_style.style_obj = data.data;
                                } else {
                                    $scope.cdt_dl_style.style_obj = [];
                                }
                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getPdtPlan", "ERROR");
                            });
                        }
                        $scope.getGaMainData = function () {
                            showLoading($ionicLoading);
                            var request = {
                                line_id: $scope.cdt.line_id,
                                style: $scope.cdt.style,
                                customer: $scope.cdt.customer,
                                sam_gsd: $scope.cdt.sam_gsd};
                            getGaMainData(request, function (data) {
                                console.log("getGaMainData", data);
                                if (data.getGaDetail) {
                                    var ga_detail_obj = angular.fromJson(data.getGaDetail);
                                    if (ga_detail_obj.errorcode == "OK") {
                                        $scope.cdt.ga_detail_obj = ga_detail_obj.data;
                                        sumGsdCyclePercent(ga_detail_obj.data);
                                    } else {
                                        $scope.cdt.total_gsd_sam = 0;
                                        $scope.cdt.ga_detail_obj = [];
                                    }
                                } else {
                                    $scope.cdt.ga_detail_obj = [];
                                    var getGsdHeaderByCdt = angular.fromJson(data.getGsdHeaderByCdt);

                                    if (getGsdHeaderByCdt.errorcode == "OK") {
                                        var gsd_header_data = getGsdHeaderByCdt.data[0];
                                        $scope.cdt.total_gsd_sam = gsd_header_data.total_sam - 0;
                                    } else {
                                        $scope.cdt.total_gsd_sam = 0;
                                    }
                                }
                                if (data.ga_main_id) {
                                    $scope.cdt.ga_main_id = data.ga_main_id;
                                } else {
                                    $scope.cdt.ga_main_id = null;
                                }
            //                    console.log('$scope.cdt.ga_main_id', $scope.cdt.ga_main_id);
                                hideLoading($ionicLoading);
                            }
                            , function () {
                                console.log("getGaMainJoinHead", "ERROR");
                            });
                        }
                        function sumGsdCyclePercent(data_ar) {
                            var total_gsd_sam = 0;
                            var total_cycletime = 0;
                            var percent_gsd = 0;
                            angular.forEach(data_ar, function (data_for, index) {
                                total_gsd_sam += (data_for.sam_gsd - 0);
                                total_cycletime += (data_for.cycletime - 0);
                            });
//                            percent_gsdpercent_gsd = ((total_cycletime - 0) - (total_gsd_sam - 0) * 100) / (total_gsd_sam - 0);

                            $scope.cdt.total_gsd_sam = parseFloat(total_gsd_sam.toFixed(3));    //Remark By P.Sirintorn JUN162017
                            $scope.cdt.total_cycletime = parseFloat(total_cycletime.toFixed(3));    //Remark By P.Sirintorn JUN162017

                            $scope.cdt.sam_detail_ratio = parseFloat(((percent_gsd < 0 ? percent_gsd * (-1) : percent_gsd)).toFixed(2));    //Remark By P.Sirintorn JUN162017

                        }
                        $scope.getGsdDataByCdn = function () {
                            showLoading($ionicLoading);
                            var request = {line_id: $scope.cdt.line_id, gsd_header_id: $scope.cdt.gsd_header_id};
                            getGsdDataByCdn(request, function (data) {
                                console.log("getGsdDataByCdn", data);
                                if (data.errorcode == "OK") {
                                    var seq_max = data.data[0].seq_max;
                                    $scope.cdt.seq_max = data.data[0].seq_max;
                                } else {
                                    $scope.cdt.seq_max = 0;
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdDataByCdn", "ERROR");
                            });
                        }
                        $scope.getGsdDetailsToGroup = function () {
                            showLoading($ionicLoading)
                            var request = {customer: $scope.cdt.customer, style: $scope.cdt.style};
                            getGsdDetailsToGroup(request, function (data) {
                                console.log("getGsdDetailsToGroup", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt_dl_timer.gsd_detail_obj = data.data;
                                    var group_ar = [];
            //                        var step_ar = [];
                                    var idx = 0;
                                    angular.forEach(data.data, function (data_for, index) {
                                        console.log('data_for.sam_detail_ratio', data_for.sam_detail_ratio);
                                        console.log('data_for.group_id', data_for.group_id);
                                        if (data_for.sam_gsd == "0" && !data_for.group_id) {
                                            data_for.index = idx;
                                            group_ar.push(data_for);
                                            idx++;
                                        }
            //                            if (data_for.group_id) {
            //                                step_ar.push(data_for);
            //                            }
                                    });
                                    $scope.cdt_dl_timer.group_obj = group_ar;
                                    console.log('group_ar', group_ar);
            //                        $scope.cdt_dl_timer.step_obj = step_ar;
            //                        $scope.cdt_dl_timer.group_data = group_ar[1];
            //                        $scope.cdt.factory_obj = data.data;
                                } else {
                                    $scope.cdt_dl_group.group_obj = [];
                                }
            //                    $scope.$apply();
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdDetailsToGroup", "ERROR");
                            });
                        }

                        $scope.getGsd = function () {
                            showLoading($ionicLoading);
                            var request = {style: $scope.cdt.style};
                            getGsd(request, function (data) {
                                console.log("getGsd", data);
                                if (data.errorcode == "OK") {
                                    $scope.cdt_dl_timer.gsd_detail_obj = data.data;
                                    var group_ar = [];
            //                        var step_ar = [];
                                    var idx = 0;
                                    angular.forEach(data.data, function (data_for, index) {
                                        console.log('data_for.gsd_name', data_for.gsd_name);
                                        console.log('data_for.code', data_for.code);
                                        //if (data_for.sam_gsd == "0" && !data_for.group_id) {
                                            data_for.index = idx;
                                            group_ar.push(data_for);
                                            idx++;
                                        //}
            //                            if (data_for.group_id) {
            //                                step_ar.push(data_for);
            //                            }
                                    });
                                    $scope.cdt_dl_timer.group_obj = group_ar;

                                    console.log('group_ar', group_ar);
            //                        $scope.cdt_dl_timer.step_obj = step_ar;
            //                        $scope.cdt_dl_timer.group_data = group_ar[1];
            //                        $scope.cdt.factory_obj = data.data;
                                } else {
                                    $scope.cdt_dl_group.group_obj = [];
                                }
            //                    $scope.$apply();
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsd", "ERROR");
                            });


                        }

                        $scope.onClickReset = function () {
                            sum_time = 0.000;
                            $scope.cdt_dl_timer.count_time = "0.000";
                            $scope.cdt_dl_timer.cycletime = "0.000";
                            $scope.cdt_dl_timer.status = "";
                            $scope.cdt_dl_timer.sam_detail_ratio = "0.00";
                            clearInterval(interval_time);
                            flag_stop = false;
                        }
                        $scope.clickStartStopT = function () {
                            console.log('clickStartStopT', 'go to')
                            if (!flag_stop) {
                                interval_time = setInterval(myTimer, 60);
                                function myTimer() {
                                    sum_time += 0.00105;
                                    $scope.cdt_dl_timer.count_time = sum_time.toString().substr(0, 5);
            //                        console.log('sum_time', sum_time);
                                    $scope.$apply();
                                }
                                flag_stop = true;
                            } else {
                                clearInterval(interval_time);
                                $scope.cdt_dl_timer.cycletime = sum_time.toString().substr(0, 5);
                                diff = $scope.cdt_dl_timer.sam - $scope.cdt_dl_timer.cycletime;
                                status_id = 0;
            //                    OLD CODE BACKUP
            //                    var percent = (($scope.cdt_dl_timer.cycletime - $scope.cdt_dl_timer.gsd_sam) * 100) / $scope.cdt_dl_timer.gsd_sam;
            //                    var percent = ($scope.cdt_dl_timer.gsd_sam / $scope.cdt_dl_timer.cycletime)*100;      // Remark By P.Sirintorn JUN112017 // Remark By P.Sirintorn NOC052017
            //                      var percent = (diff / $scope.cdt_dl_timer.gsd_sam)*100;     Remark By P.Sirintorn JUN132017

                                var percent = 0;
//                                if(diff > 0){ //Remark by P.Sirintorn NOV082017
//                                    percent = ($scope.cdt_dl_timer.cycletime / $scope.cdt_dl_timer.gsd_sam)*100;
//
//                                }else if(diff < 0){
                                    percent = ($scope.cdt_dl_timer.sam / $scope.cdt_dl_timer.cycletime)*100;
//                                }else{
//                                    percent = 100;
//                                }

                                $scope.cdt_dl_timer.sam_detail_ratio = ((percent < 0 ? percent * (-1) : percent) - 0).toFixed(3);

                                //                    OLD CODE BACKUP
            //                    $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.sam_detail_ratio ? "เกิน" : "ไม่เกิน");
                                $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.sam ? "เกิน" : "ไม่เกิน");
                                if($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.sam){
                                    status_id = 10;
                                }else{
                                    status_id = 9;
                                }
                                $scope.cdt.status_id = status_id;
//                                alert('cycletime '+$scope.cdt_dl_timer.cycletime+' status '+status_id);
                                //SET StatusID
            //                    $scope.setSttIdByCcTTimer();
                                flag_stop = false;
                            }

                        }
                        $scope.onClickSaveTimer = function () {
                            if (validateSaveTimer()) {
            //                    showLoading($ionicLoading);
             //                   alert('sam gsd '+ $scope.cdt_sam_gsd +' cycletime ');
                                var step_data = angular.fromJson($scope.cdt_dl_timer.step_data);
                                var request = {
                                    ga_detail_id: ($scope.cdt_dl_timer.ga_detail_id ? $scope.cdt_dl_timer.ga_detail_id : '')
//                                    , gsd_detail_id: ($scope.cdt_dl_timer.ga_detail_id ? '' : step_data.id)   //Remark By P.Sirintorn APR192020
                                    , ga_main_id: ($scope.cdt_dl_timer.ga_detail_id ? '' : $scope.cdt.ga_main_id)
                                    , cycletime: $scope.cdt_dl_timer.cycletime
//                                    , diff: $scope.cdt_dl_timer.gsd_sam - $scope.cdt_dl_timer.cycletime   Remark By P.Sirintorn JUN112017
                                    , diff : diff
                                    , sam_detail_ratio: $scope.cdt_dl_timer.sam_detail_ratio
                                    , status_id: $scope.cdt.status_id
                                    , sam : $scope.cdt_dl_timer.sam
                                    , code : $scope.cdt_dl_timer.code
                                    , gsd_name : $scope.cdt_dl_timer.gsd_name}; // Remark By P.Sirintorn JUN202017
//                                alert($scope.cdt.status_id);
                                if ($scope.cdt_dl_timer.ga_detail_id) {
                                    updateGaDetailData(request);
                                } else {
                                    addGaDetailData(request);
                                }

                            }

                        }

                        $scope.onClickRevision = function () {
                            $scope.getGsdAllRevision();
                            $scope.dialog_gsd_revision.show();
                        };

                        $scope.getGsdAllRevision = function () {
                            showLoading($ionicLoading);
                            var request = {
                                line_id: $scope.cdt.line_id,
                                style: $scope.cdt.style,
                                customer: $scope.cdt.customer,
                            };
                            getGsdAllRevision(request, function (data) {
                                console.log("getGsdAllRevision ", data);

                                if (data.errorcode == "OK") {
                                    $scope.ga_main_all_data.ga_main_obj = data.data;
//                                    $scope.cdt.mode = 'view';


                                    setItvGaDetail();
                                }
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("getGsdAllRevision ", "ERROR");
                            });
                        }

                $scope.onSelectRevision = function (data) {

                    var ga_main_data = data;
                    if(ga_main_data.revision == max_rev){
                        $scope.cdt.mode = 'update';
                    }else{
                        $scope.cdt.mode = 'view';
                    }


                    $scope.cdt.ga_main_id = ga_main_data.id;
                    $scope.getGaDetail(ga_main_data.id);
                    $scope.cdt.total_gsd_sam = parseFloat((ga_main_data.sam_gsd - 0).toFixed(3));
                    $scope.cdt.total_cycletime = parseFloat((ga_main_data.total_cycletime - 0).toFixed(3));
                    $scope.cdt.sam_header_ratio = parseFloat((ga_main_data.sam_header_ratio - 0).toFixed(3));
                    $scope.cdt.revision = (ga_main_data.revision -0); //Remark By P.Sirintorn JUN202017
                    $scope.cdt.last_update = ga_main_data.create_datetime;

                    setItvGaDetail();

                    flag_timer = true;
//                    timerDataGrid();
                    $scope.dialog_gsd_revision.hide();
                }

                        function addGaDetailData(request) {
                            addGaDetailsSL(request, function (data) {
                                console.log("addGaDetailsSL", data);
                                var msg_save = "";
                                if (data.errorcode == "OK") {
                                    msg_save = "Save Success";
                                } else {
                                    msg_save = "Save No Success!"
                                }
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Status Save Details',
                                    template: msg_save
                                });
                                alertPopup.then(function (res) {
                                    if (data.errorcode == "OK") {
                                        $scope.dialog_content_timer.hide();

                                        $scope.getGaMainByCdt();

                                    }
                                });
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("addGaDetails", "ERROR");
                            });
                        }
                        function updateGaDetailData(request) {
                            updateGaDetailsSL(request, function (data) {
                                console.log("updateGaDetailDataSL", data);
                                var msg_save = "";
                                if (data.errorcode == "OK") {
                                    msg_save = "Save Success";
                                } else {
                                    msg_save = "Save No Success!"
                                }
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Status Save Details',
                                    template: msg_save
                                });
                                alertPopup.then(function (res) {
                                    if (data.errorcode == "OK") {
                                        $scope.dialog_content_timer.hide();
                                        $scope.getGaMainByCdt();
                                    }
                                });
                                hideLoading($ionicLoading);
                            }, function () {
                                console.log("addGaDetails", "ERROR");
                            });
                        }
                        $scope.onClickRowGaDet = function (row_data, index) {
                            console.log('row_data', row_data);
                            sum_time = 0.000;
                            status_id = 0;
                            $scope.cdt_dl_timer = {};
                            $scope.cdt_dl_timer.count_time = "0.000";
                            $scope.cdt_dl_timer.ga_detail_id = row_data.id;
                            $scope.cdt_dl_timer.cycletime = (row_data.cycletime - 0).toFixed(3);
                            $scope.cdt_dl_timer.sam = (row_data.sam_gsd - 0).toFixed(3);
            //                alert(row_data.sam_detail_ratio);
            //                var percent = (diff / $scope.cdt_dl_timer.gsd_sam)*100;        Remark By P.Sirintorn JUN132017
                             var percent = $scope.cdt_dl_timer.sam_detail_ratio = (row_data.sam_detail_ratio - 0).toFixed(2);   // Remark By P.Sirintorn JUN112017
                             $scope.cdt_dl_timer.sam_detail_ratio = (percent - 0).toFixed(2);

                            $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.sam ? "เกิน" : "ไม่เกิน");
                            if($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.gsd_sam){
                                  status_id = 10;
                            }else{
                                  status_id = 9;
                            }
                            $scope.cdt_dl_timer.gsd_name = row_data.description;
//                            $scope.cdt_dl_timer.description = row_data.description;
                            $scope.dialog_content_timer.show();
                            $scope.cdt_dl_timer.status_id = status_id;
                            setHighlightRow(index);
                            onClickClear();
                        };
                        function validateSaveTimer() {
                            var msg_save = "";
                            if (!$scope.cdt_dl_timer.group_data && !$scope.cdt_dl_timer.ga_detail_id) {
                                msg_save += (msg_save == "" ? "" : ",") + "Select GSD";
                            }
//                            if (!$scope.cdt_dl_timer.step_data && !$scope.cdt_dl_timer.ga_detail_id) {
//                                msg_save += (msg_save == "" ? "" : ",") + "Step";
//                            }
                            if (!$scope.cdt_dl_timer.cycletime) {
                                msg_save += (msg_save == "" ? "" : ",") + "Cycletime";
                            }
                            if (msg_save != "") {
                                $ionicPopup.alert({
                                    title: 'Prepare Data To Save Timer',
                                    template: "Please " + "<span style='color:#cc3300'>" + msg_save + "</span>"
                                });
                                hideLoading($ionicLoading);
                                return false;
                            } else {
                                return true;
                            }
                        }

                        $scope.deleteRow = function (ga_detail_id, index) {
                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Warning Delete Ga Detail',
                                template: 'Are you sure you want to delete this row?'
                            });
                            confirmPopup.then(function (res) {
                                if (res) {
                                    deleteGaDetailById(ga_detail_id, index);
                                    console.log('You are sure');
                                } else {
                                    console.log('You are not sure');
                                }
                            });
                        };
                        function deleteGaDetailById(ga_detail_id, index) {
                            showLoading($ionicLoading);
                            var request = {ga_detail_id: ga_detail_id};
                            deleteGaDetail(request, function (data) {
                                console.log("deleteGaDetail", data);
                                var msg_save = "";
                                if (data.errorcode == "OK") {
            //                        $scope.cdt.ga_detail_obj[index].splice(index, 1);
                                    msg_save = "Delete Success";
                                } else {
                                    msg_save = "Delete No Success!";

                                }
                                hideLoading($ionicLoading);
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Status Delete Details',
                                    template: msg_save
                                });
                                alertPopup.then(function (res) {
                                    if (data.errorcode == "OK") {
            //                            $scope.dialog_content_timer.hide();
                                        $scope.getGaMainByCdt();
                                    }
                                });

                            }, function () {
                                console.log("deleteGaDetail", "ERROR");
                                hideLoading($ionicLoading);
                            });
                        }
                        function setHighlightRow(_index) {
                            angular.forEach($scope.cdt.ga_detail_obj, function (data_for, index) {
                                if (index == _index) {
                                    $scope.cdt.ga_detail_obj[index].select_row = true;

                                } else {
                                    $scope.cdt.ga_detail_obj[index].select_row = false;
                                }
                            });
                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        }
             $scope.btnAutoData = function () {
                console.log("Click Auto Hanger 4 GSD");
                    var data = $scope.cdt.lbc_obj;
                    var res = null;
    //                if ($scope.cdt.order_status == '0' || $scope.cdt.order_status == '2') {
    //                    res = alasql('SELECT * FROM ? ORDER BY cycletime ASC', [data]);
    //                    $scope.cdt.order_status = '1';
    //                } else if ($scope.cdt.order_status == '1') {
    //                    res = alasql('SELECT * FROM ? ORDER BY cycletime DESC', [data]);
    //                    $scope.cdt.order_status = '2';
    //                }
    //                $scope.cdt.lbc_obj = res;
    //                //clear graph
    //                clearGraph();
    //                //set graph
    //                $scope.updateChartValue($scope.cdt.lbc_obj);
    //                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
    //                    $scope.$apply();
    //                }
                      $scope.dialog_auto_data_4tabgsd_pickup.show();
                };
                $scope.tb_row_color = function (row_data) {
                    console.log('tb_row_color data', row_data);
                }

            $scope.onClickSearch = function () {
            console.log("onClickSearch ");
                if(validateDateTime()){
                var st = startDateTime,
                    stformat = [st.getFullYear(),
                                st.getMonth()+1,
                               st.getDate()].join('-')+' '+
                              [st.getHours(),
                               st.getMinutes(),
                               st.getSeconds()].join(':');
                var ft = finishDateTime,
                    ftformat = [ft.getFullYear(),
                                ft.getMonth()+1,
                               ft.getDate()].join('-')+' '+
                              [ft.getHours(),
                               ft.getMinutes(),
                               ft.getSeconds()].join(':');

//                    $ionicPopup.alert({
//                        title: ' Start and Finish Datetime',
//                        template: $scope.cdt.id+" "+ $scope.cdt.line_id+" "+$scope.cdt.style_data.style+" "+st+ "<span style='color:#cc3300'>" + ft + "</span>"
//                    });
//                $scope.deleteLbDetail4Median();               //MAR062019
                $scope.getMaxGSDStationId(stformat,ftformat);    //MAY252020
//                showLoading($ionicLoading);
//
//                cdt.start_date = '';
//                cdt.finish_date = '';
                    }
                }

                function validateDateTime() {
                     var msg = "";
                     if (!$scope.cdt.start_date) {
                         msg += (msg == "" ? "" : ",") + "Start Date";
                     }else{
                         startDateTime = $scope.cdt.start_date;
                     }

                     if (!$scope.cdt.finish_date) {
                         msg += (msg == "" ? "" : ",") + "Finish Date";
                     }else{
                         finishDateTime = $scope.cdt.finish_date;
                     }

                     if(startDateTime > finishDateTime){
                         msg += (msg == "" ? "" : ",") + "Start datetime before Finish datetime.";
                     }

                     if (msg != "") {
                         $ionicPopup.alert({
                             title: 'Warning Start and Finish Datetime',
                             template: "Please input " + "<span style='color:#cc3300'>" + msg + "</span>"
                         });
                         //hideLoading($ionicLoading);
                         return false;
                     } else {

                         return true;
                     }
                 }

                $scope.getMaxGSDStationId = function (stformat,ftformat) {

                     var station_id = 1;
                     var request = {line_id: $scope.cdt.line_id, start_datetime: stformat, finish_datetime: ftformat};
                     getMaxGSDStationId(request, function (data) {

                 //    showLoading($ionicLoading);
                     console.log("getMaxGSDStationId", data);
                     if (data.errorcode == "OK") {

                         var max_id = data.data[0];
                         $scope.cdt.max_station_id = (max_id.max_stat_id ? max_id.max_stat_id : 0);

                         while(station_id <= $scope.cdt.max_station_id) {

                             showLoading($ionicLoading);
                             $scope.cdt.cycletime = 0;
                             $scope.cdt.employee = '';
                             $scope.cdt.status_id = 0;
                             var style_data = $scope.cdt.style;  //angular.fromJson($scope.cdt.style_data);

                             var request = {line_id : $scope.cdt.line_id,start_datetime: stformat, finish_datetime: ftformat, station_id: station_id, style: style_data};
                             getGSDMedianData(request, function (data) {
                                 console.log("getGSDMedianData ", data);
                                 pause(1000);
                                 if (data.errorcode == "OK") {
                                     pause(2500);
                                     var median_data = data.data[0];
                                     $scope.cdt.cycletime = median_data.cycletime;
                                     $scope.cdt.station_id = median_data.station_id;
                                     $scope.cdt.line = median_data.line;
                                     $scope.cdt.code = median_data.operation_code

                                     pause(500);
                                     $scope.stdStatusId();

                                     var request = {
                                      ga_main_id:  $scope.cdt.ga_main_id
                                      , cycletime: $scope.cdt.cycletime
//                                      , status_id: status_id
                                      , style: style_data      //style_data
                                      , line: $scope.cdt.line
                                      , code: $scope.cdt.code};
                                      addGSDDetailMedian(request, function (data) {
                                          console.log("addGSDDetailMedian", data);
                                          pause(2000);
                                          var msg_save = "";
                                          if (data.errorcode == "OK") {

                                              msg_save = "Save GSD Data Median Success";

                                          } else {
                                              msg_save = "Save GSD Data Median No Success";
                                          }
     //                                     var alertPopup = $ionicPopup.alert({
     //                                         title: 'Warning Save',
     //                                         template: msg_save
     //                                     });
     //                                     alertPopup.then(function (res) {
     //                                         if (data.errorcode == "OK") {
     //                                             console.log('Close Dialog Save Median Go to getLbMainByCdt');
     //                                            // $scope.getLbMainByCdt();
     //                                         }
     //
     //                                     });
      //                                    $scope.cdt.roundcount = station_id;

                                      }, function () {
                                          console.log("addGSDDetailMedian", "ERROR");
                                      });

                                 }
                             }, function () {
                                 console.log("getGSDMedianData ", "ERROR");
                             });
                             //pause(1000);
                             station_id++;

                             }

                         }
                     }, function () {
                         console.log("getMaxGSDStationId", "ERROR");
                     });

                      hideLoading($ionicLoading);
                 }

       function pause(numberMillis) {
       console.log("pause ", "OK");
           var now = new Date();
           var exitTime = now.getTime() + numberMillis;
           while (true) {
               now = new Date();
               if (now.getTime() > exitTime)
                   return;
           }
       }

       $scope.stdStatusId = function () {
           var takttime_plan = $scope.cdt.takttime_plan - 0;
           //SET status id
           if (($scope.cdt.cycletime - 0) > (takttime_plan * (100 / 100))) {
               //                        alert('1');
               $scope.cdt.status_id = '7';
           } else if ((takttime_plan * (85 / 100)) <= $scope.cdt.cycletime  && $scope.cdt.cycletime  <= (takttime_plan * (100 / 100))) {
               //                        alert('2');
               $scope.cdt.status_id = '6';
           } else if (($scope.cdt.cycletime  - 0) < (takttime_plan * (85 / 100)) && ($scope.cdt.cycletime- 0) > (takttime_plan * (50 / 100))) {
               //                        alert('3');
               $scope.cdt.status_id = '5';
           }else{
               $scope.cdt.status_id = '8';
           }
           console.log('status_id!!', $scope.cdt.status_id);


       }


                $scope.getGaMainById = function () {
                        showLoading($ionicLoading);
        //                 sam_gsd: $scope.cdt.sam_gsd
                        var request = {
                            line_id: $scope.cdt.line_id,
                            style: $scope.cdt.style,
                            customer: $scope.cdt.customer,
                        };
                        getGaMainByCdt(request, function (data) {
                            console.log("getGaMainById ", data);
                            if (data.errorcode == "OK") {
                                var data_obj = data.data[0];
                                $scope.cdt.ga_main_id = data_obj.id;
                                $scope.cdt.total_gsd_sam = parseFloat((data_obj.sam_gsd - 0).toFixed(3));
                                $scope.cdt.total_cycletime = parseFloat((data_obj.total_cycletime - 0).toFixed(3));
                                $scope.cdt.sam_header_ratio = parseFloat((data_obj.sam_header_ratio - 0).toFixed(3));
                                $scope.cdt.revision = (data_obj.revision -0); //Remark By P.Sirintorn JUN202017
//                                                        $scope.getGaDetail(data_obj.id);
                            }
        //                    hideLoading($ionicLoading);
                        }, function () {
                            console.log("getGaMainId ", "ERROR");
                        });
                    }
                })

        .directive('focusMe', function ($timeout, $parse) {
            return {
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.focusMe);
                    scope.$watch(model, function (value) {
                        //                console.log('value=', value);
                        if (undefined != value && value === true) {
                            $timeout(function () {
                                element[0].focus();
                            });
                        }
                    });
                    element.bind('blur', function () {
                        console.log('blur');
                        scope.$apply(model.assign(scope, false));
                    })
                }
            };
        });

function getstrkeynowdatetime() {
    var date = new Date();
    var str = getstrkeynowdate() + padleft(date.getHours(), 2, '0') + padleft(date.getMinutes(), 2, '0') + padleft(date.getSeconds(), 2, '0');
    return str;
}
function getstrkeynowdate() {
    var date = new Date();
    var str = padleft(date.getFullYear(), 2, '0') + padleft((date.getMonth() + 1), 2, '0') + padleft(date.getDate(), 2, '0');
    return str;
}
function getDateNowYYYYMMDD_HHMMSS() {
    var d = new Date();
    var datetime = d.getFullYear() + "-"
            + ("00" + (d.getMonth() + 1)).slice(-2) + "-"
            + ("00" + d.getDate()).slice(-2) + " "
            + ("00" + d.getHours()).slice(-2) + ":"
            + ("00" + d.getMinutes()).slice(-2) + ":"
            + ("00" + d.getSeconds()).slice(-2);
    return datetime;
}


//check sum serial sim
function processsim(sn) {
    sn = "89" + sn;
    var snx2 = "";
    var snsumtotal = 0;
    var snx9;
    var snsumtotal = 0;
    for (index = 0; index < sn.length; index++) {
        if (index % 2 == 0) {
            var snnum = parseInt(sn[index]);
            var snnumtox2 = snnum * 2;
            snx2 = snx2 + sn[index];
        } else {
            var snnum = parseInt(sn[index]);
            var snnumtox2 = snnum * 2;
            if (snnumtox2.toString().length > 1) {
                snindex0 = parseInt(snnumtox2.toString()[0]);
                snindex1 = parseInt(snnumtox2.toString()[1]);
                snsum = snindex0 + snindex1;
                snx2 = snx2 + snsum;
            } else {
                snx2 = snx2 + parseInt(snnumtox2);
            }
        }
    }
    if (snx2.length > 1) {
        var snnum;
        var snsum;
        for (index = 0; index < snx2.length; index++) {
            snnum = parseInt(snx2[index]);
            snsumtotal = snsumtotal + snnum;
            snx9 = snsumtotal * 9;
        }
    }
//this out put result
//console.log(sn + " " + snx9.toString()[snx9.toString().length - 1]);
    return sn + snx9.toString()[snx9.toString().length - 1];
}
function showLoading(view_cpn) {
    view_cpn.show({
        template: '<img src="img/loading/Loading1.gif" style="width: 65px;height: 65px;"/>'
    });
}
function hideLoading(view_cpn) {
    view_cpn.hide();
}
function padleft(data, len, str) {
    data = '' + data;
    for (var i = data.length; i < len; i++) {
        data = str + data;
    }
//console.log("padleft : "+data);
    return data;
}

function checkCashEmpId($state) {
    var empid = localStorage.getItem("login_empid");
    if (!empid) {
        $state.go('login');
    }
}

