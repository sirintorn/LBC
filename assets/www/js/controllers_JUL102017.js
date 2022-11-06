angular.module('starter.controllers', ['ionic'])


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
        .controller('NewInstall', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
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

            function init() {
            }
            $scope.$on('$ionicView.enter', function () {
                $scope.cdt = {};
                $scope.cdt_dl_style = {};
                $scope.cdt_dl_gsd = {};

                $scope.getGsdHeader();
                $scope.getFactory();
                $scope.height_chart = window.innerHeight / 50;
                $scope.orderProp = 'seq';
                $scope.orderFlagProp = false;
                $scope.scrollbarConfig = {
                    theme: 'minimal-dark',
                    scrollInertia: 500
                }
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
                if (validateFormLbMain()) {
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
                }
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
                    attatch_chart: $scope.cdt.attatch_chart};
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
            $scope.onClickRowLbc = function (row_data, index) {
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
                //new request spec
                $scope.cdt_dl_lbc.status_id = row_data.status_id;
                //
                //$scope.getGsdDetailByCdt(gsd_header_id, gsd_detail_id);  // Remark By P.Sirintorn FEB072017
//                $scope.getWorkgroupFilter(gsd_detail_id);   // Remark By P.Sirintorn FEB072017
                $scope.cdt_dl_lbc.group_name = row_data.description;
                $scope.cdt_dl_lbc.group_code = row_data.code;
                $scope.dialog_content_lbc.show();
                setHighlightRow(index);
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
            function getColorChart(value) {
                if (value) {
                } else if (value) {

                } else if (value) {

                }
            }
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
                clearGraph();
                $scope.getGsdHeaderByCust($scope.cdt.customer);
            }
            $scope.onChangeOptTakt = function () {
//                $scope.cdt.total_sam = 0;
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
                        $scope.cdt.mode = 'update';
                        $scope.cdt.id = lb_main_data.id;
                        $scope.cdt.total_sam = (lb_main_data.sam_gsd - 0).toFixed(3);
                        //                        console.log('(lb_main_data.otp_target - 0).toFixed(3)',(lb_main_data.otp_target - 0).toFixed(3));
                        $scope.cdt.otp_target = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                        $scope.cdt.takttime_plan = parseFloat((lb_main_data.takttime_plan - 0).toFixed(3));
                        $scope.cdt.total_cycletime = parseFloat((lb_main_data.total_cycletime - 0).toFixed(3));
                        $scope.cdt.cycletime_max = parseFloat((lb_main_data.cycletime_max - 0).toFixed(3));
                        $scope.cdt.man = lb_main_data.man - 0;
                        $scope.cdt.percent_balance = parseFloat((lb_main_data.percent_balance - 0).toFixed(3));
                        $scope.cdt.bn_position = lb_main_data.bn_position;
                        $scope.cdt.bn_employee = lb_main_data.bn_employee;
                        $scope.cdt.bn_output = parseFloat(lb_main_data.bn_output);
                        $scope.cdt.bn_eff = parseFloat((lb_main_data.bn_eff - 0).toFixed(3));
                        $scope.cdt.bn_otp = parseFloat((lb_main_data.bn_otp - 0).toFixed(3));
                        $scope.cdt.last_update = lb_main_data.create_datetime;
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
                clearGraph();

                $scope.getCustomerByCode(data.style);
                $scope.dialog_style.hide();
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
                var balance = parseFloat(((total_cycletime * 100) / (max_cycletime * man)).toFixed(3));
                //เอา position_code ที่ cycletime มากสุดมา
                var position_code = data_obj[index_max_cycle].code;       //P.Sirintorn MAR112017
                //เอา emp_code ที่ cycletime มากสุดมา
                var emp_code = data_obj[index_max_cycle].employee;        //P.Sirintorn MAR112017
                var bn_output = parseFloat(60 / max_cycletime);
                var bn_eff = parseFloat((((bn_output * $scope.cdt.total_sam) / (man * 60)) * 100).toFixed(3));
                var bn_otp = parseFloat(((($scope.cdt.takttime_plan / max_cycletime) * 100).toFixed(3)));
                $scope.cdt.mode = 'update';
                $scope.cdt.total_cycletime = parseFloat(total_cycletime);
                $scope.cdt.cycletime_max = parseFloat(max_cycletime);
                $scope.cdt.man = parseFloat(man);
                $scope.cdt.percent_balance = parseFloat(balance);
                $scope.cdt.bn_output = parseFloat(bn_output);
                $scope.cdt.bn_eff = parseFloat(bn_eff);
                $scope.cdt.bn_otp = parseFloat(bn_otp);
                $scope.cdt.bn_employee = emp_code;
                $scope.cdt.bn_position = position_code;
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
                                                            labelString: 'Test'
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
            $scope.onClickIconStyle = function () {
                $scope.cdt_dl_style.style_keyword = '';
                $scope.dialog_style.show();
            };
            $ionicModal.fromTemplateUrl('templates/dialog_style.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.dialog_style = modal;
            });
            $scope.onClickIconCust = function () {
                $scope.cdt_dl_gsd.keyword_cust = '';
                $scope.dialog_gsd_header.show();
            };

            $scope.getLbMainById = function () {
                            showLoading($ionicLoading);
                            var style_data = angular.fromJson($scope.cdt.style_data);
                            var request = {lb_main_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                            getLbMainByCdt(request, function (data) {
                                console.log("getLbMainByCdt ", data);

                                if (data.errorcode == "OK") {
                                    var lb_main_data = data.data[0];
                                    $scope.cdt.mode = 'update';
                                    $scope.cdt.id = lb_main_data.id;
                                    $scope.cdt.total_sam = (lb_main_data.sam_gsd - 0).toFixed(3);
                                    $scope.cdt.otp_target = parseFloat((lb_main_data.otp_target - 0).toFixed(3));
                                    $scope.cdt.takttime_plan = parseFloat((lb_main_data.takttime_plan - 0).toFixed(3));
                                    $scope.cdt.total_cycletime = parseFloat((lb_main_data.total_cycletime - 0).toFixed(3));
                                    $scope.cdt.cycletime_max = parseFloat((lb_main_data.cycletime_max - 0).toFixed(3));
                                    $scope.cdt.man = lb_main_data.man - 0;
                                    $scope.cdt.percent_balance = parseFloat((lb_main_data.percent_balance - 0).toFixed(3));
                                    $scope.cdt.bn_position = lb_main_data.bn_position;
                                    $scope.cdt.bn_employee = lb_main_data.bn_employee;
                                    $scope.cdt.bn_output = parseFloat(lb_main_data.bn_output);
                                    $scope.cdt.bn_eff = parseFloat((lb_main_data.bn_eff - 0).toFixed(3));
                                    $scope.cdt.bn_otp = parseFloat((lb_main_data.bn_otp - 0).toFixed(3));
                                    $scope.cdt.last_update = lb_main_data.create_datetime;
                                    showLoading($ionicLoading);
                                    $scope.getLinebalanceView($scope.cdt.id);
            //                        $scope.getLinebalanceView($scope.cdt.id);
                                    flag_timer = true;
                                    timerDataGrid();

                                }
                                hideLoading($ionicLoading);
                                //                    $scope.$apply();
                            }, function () {
                                console.log("getLbMainById ", "ERROR");
                            });
                        }

        })
        .controller('NewInstall_BKUP', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
            var flag_stop = false;
            var interval_time;
            var sum_time = 0.000;
            function init() {
            }
            $scope.$on('$ionicView.enter', function () {
                $scope.cdt = {};
                $scope.getFactory();
                $scope.height_chart = window.innerHeight / 50;
                $scope.orderProp = 'seq';
                $scope.orderFlagProp = false;
                $scope.scrollbarConfig = {
                    theme: 'minimal-dark',
                    scrollInertia: 500
                }

//                $scope.getLinebalanceView('119');
            });
            $scope.btnOrderDefault = function (data) {
//                var data = $scope.cdt.lbc_obj;
                var res_sort1 = alasql('SELECT * FROM ? ORDER BY CAST(gcode_id AS INT) ASC , CAST(seq AS INT) ASC', [data]);
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
//            $scope.sort = function (item) {
////                if ($scope.orderProp == 'date') {
////                    return new Date(item.date);
////                }
//                return item[$scope.orderProp];
//            }
//            $scope.flag_sort = function (item) {
////                if ($scope.orderProp == 'date') {
////                    return new Date(item.date);
////                }
//                return item[$scope.orderFlagProp];
//            }



//            *************************************
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
                if (validateFormLbMain()) {
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
                }
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
                    attatch_chart: $scope.cdt.attatch_chart};
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
//            $scope.onChangeOptTakt = function () {
//                if (!$scope.cdt.id) {
//                    if (vldFormAdd()) {
//                        $scope.getGsdHeaderByCdt();
//                    }
//                }
//            };
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
            $scope.onClickRowLbc = function (row_data, index) {
                console.log('row_data', row_data);
                $scope.cdt_dl_lbc = {};
                $scope.cdt_dl_empcode = {};
                sum_time = 0.000;
                var style_data = angular.fromJson($scope.cdt.style_data);
                var gsd_header_id = style_data.id;
                var gsd_detail_id = row_data.gsd_detail_id;
//                alert('gsd_header_id=' + gsd_header_id + ' ,gsd_detail_id=' + gsd_detail_id);
                $scope.cdt_dl_lbc.emp_code = row_data.employee;
//                $scope.cdt_dl_lbc.group_code = row_data.code;
//                $scope.cdt_dl_lbc.group_name = row_data.description;
                $scope.cdt_dl_lbc.lb_details_id = row_data.id;
//                alert(row_data.cycletime);
                $scope.cdt_dl_lbc.cycletime = (row_data.cycletime - 0).toFixed(3);
                //new request spec
                $scope.cdt_dl_lbc.status_id = row_data.status_id;
//
                $scope.getGsdDetailByCdt(gsd_header_id, gsd_detail_id);
                setHighlightRow(index);
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
            function getColorChart(value) {
                if (value) {
                } else if (value) {

                } else if (value) {

                }
            }
            $scope.onClickAdd = function () {
//                $scope.getLinebalanceViewz($scope.cdt.line_id);
//                if (!$scope.cdt.id) {
                if (vldFormAdd()) {
                    if (!$scope.cdt.id) {
//                        alert('1');
                        $scope.getGsdHeaderByCdt();
                    } else {
//                        alert('2');
                        $scope.cdt_dl_as = {};
                        $scope.dialog_add_seq.show();
                        $scope.getMaxSeqLbD($scope.cdt.id);
                    }
                }
//                }


            };
            $scope.onClickOkAs = function () {
                showLoading($ionicLoading);
                if (!($scope.cdt_dl_as.emp_qty && $scope.cdt_dl_as.emp_qty > 0)) {
                    $ionicPopup.alert({
                        title: 'Warning Add Seq',
                        template: "Employee Qty ต้องมีค่ามากกว่า 0"
                    });
                    hideLoading($ionicLoading);
                } else {
                    if ($scope.cdt_dl_as.after_seq == 0 && $scope.cdt_dl_as.seq_max == 0) {
//                        alert('1');
//                        @FormParam("emp_qty") String emp_qty, @FormParam("lb_main_id") String lb_main_id
                        $scope.addLbDetails($scope.cdt_dl_as.emp_qty, $scope.cdt.id);
                    } else if ($scope.cdt_dl_as.after_seq != 0 && $scope.cdt_dl_as.seq_max > 0) {
//                        alert('2');
                        var after_seq = $scope.cdt_dl_as.after_seq;
                        var seq_max = $scope.cdt_dl_as.seq_max;
                        var emp_qty = $scope.cdt_dl_as.emp_qty;
                        var lb_main_id = $scope.cdt.id;
                        var user_id = $scope.cdt.user_id;
                        alert(user_id);
                        $scope.upOldLbDAddNewLbD(after_seq, seq_max, emp_qty, lb_main_id, user_id);
                    }
                }

            }
            $scope.upOldLbDAddNewLbD = function (after_seq, seq_max, emp_qty, lb_main_id, user_id) {
                var request = {after_seq: after_seq, seq_max: seq_max, emp_qty: emp_qty, lb_main_id: lb_main_id, user_id: user_id};
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
                                $scope.getLinebalanceView(lb_main_id);
                            }
                        });
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("upOldLbDAddNewLbD", "ERROR");
                });
            }
            $scope.addLbDetails = function (emp_qty, line_id) {
//                @FormParam("emp_qty") String emp_qty, @FormParam("lb_main_id") String lb_main_id
                var request = {emp_qty: emp_qty, lb_main_id: line_id};
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
                                $scope.getLinebalanceView(line_id);
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
            //***********************Start Modal Customer***********************
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
            //
//            // Triggered in the login modal to close it
//            $scope.closeCustModal = function () {
//                $scope.modal_cust.hide();
//            };
            $scope.saveLbDetail = function () {
                showLoading($ionicLoading);
                if (validateSaveLbDetail()) {
                    var request = {gsd_detail_id: $scope.cdt_dl_lbc.gsd_detail_data.id
                        , employee: $scope.cdt_dl_lbc.emp_code
                        , cycletime: $scope.cdt_dl_lbc.cycletime
                        , id: $scope.cdt_dl_lbc.lb_details_id
                        , status_id: $scope.cdt_dl_lbc.status_id
                        , user_id: $scope.cdt.user_id};
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
                        console.log("ERROR updateLbDetailByCdt", "ERROR");
                    });
                }
            };
            function validateSaveLbDetail() {
                var msg_save = "";
                if (!$scope.cdt_dl_lbc.emp_code) {
                    msg_save += (msg_save == "" ? "" : ",") + "Employee Code";
                }
                if (!$scope.cdt_dl_lbc.gsd_detail_data) {
                    msg_save += (msg_save == "" ? "" : ",") + "Group Code";
                }
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
                });
            }
            $scope.onChangeFactory = function () {
                showLoading($ionicLoading);
                //clear ddl line
                $scope.cdt.line_id = '';
                $scope.cdt.lbf_obj = [];
                //clear ddl customer
                $scope.cdt.customer = '';
                $scope.cdt.cust_obj = [];
                //clear ddl style
                $scope.cdt.style_data = '';
                $scope.cdt.style_obj = [];
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = '';
                $scope.cdt.takttime_plan = '';
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
                clearGraph();
                $scope.getLineBuilFac($scope.cdt.factory_id);
            };
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
            $scope.getGsdHeader = function () {
                showLoading($ionicLoading);
                //clear ddl customer
                $scope.cdt.customer = '';
                $scope.cdt.cust_obj = [];
                //clear ddl style
                $scope.cdt.style_data = '';
                $scope.cdt.style_obj = [];
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = '';
                $scope.cdt.takttime_plan = '';
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
                clearGraph();
                var request = {request: ''};
                getGsdHeader(request, function (data) {
                    console.log("getGsdHeader", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.cust_obj = data.data;
                        $scope.$apply();
                    } else {
                        $scope.cdt.cust_obj = {};
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeader", "ERROR");
                });
            }
            $scope.getGsdHeaderByCust = function (customer) {
                showLoading($ionicLoading);
                var request = {customer: customer};
                getGsdHeaderByCust(request, function (data) {
                    console.log("getGsdHeaderByCust ", data);
                    if (data.errorcode == "OK") {
                        $scope.cdt.style_obj = data.data;
                    } else {
                        $scope.cdt.style_obj = {};
                    }
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getGsdHeaderByCust ", "ERROR");
                });
            }
            $scope.onChangeCust = function () {
                //clear ddl style
                $scope.cdt.style_data = '';
                $scope.cdt.style_obj = [];
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = '';
                $scope.cdt.takttime_plan = '';
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
                clearGraph();
                $scope.getGsdHeaderByCust($scope.cdt.customer);
            }
            $scope.getLbMainByCdt = function () {
                showLoading($ionicLoading);
                var style_data = angular.fromJson($scope.cdt.style_data);
//                console.log('style_data ', angular.fromJson(style_data));
//                console.log('style_data json',JSON.parse(style_data));
//                alert(style_data.style);
                var request = {line_id: $scope.cdt.line_id, customer: $scope.cdt.customer, style: style_data.style};
                getLbMainByCdt(request, function (data) {
                    console.log("getLbMainByCdt ", data);
                    if (data.errorcode == "OK") {
                        var lb_main_data = data.data[0];
                        $scope.cdt.mode = 'update';
                        $scope.cdt.id = lb_main_data.id;
                        $scope.cdt.total_sam = (lb_main_data.total_sam - 0).toFixed(3);
                        $scope.cdt.otp_target = (lb_main_data.otp_target - 0).toFixed(3);
                        $scope.cdt.takttime_plan = (lb_main_data.takttime_plan - 0).toFixed(3);
                        $scope.cdt.total_cycletime = (lb_main_data.total_cycletime - 0).toFixed(3);
                        $scope.cdt.cycletime_max = (lb_main_data.cycletime_max - 0).toFixed(3);
                        $scope.cdt.man = lb_main_data.man;
                        $scope.cdt.percent_balance = (lb_main_data.percent_balance - 0).toFixed(3);
                        $scope.cdt.bn_position = lb_main_data.bn_position;
                        $scope.cdt.bn_employee = lb_main_data.bn_employee;
                        $scope.cdt.bn_output = lb_main_data.bn_output;
                        $scope.cdt.bn_eff = (lb_main_data.bn_eff - 0).toFixed(3);
                        $scope.cdt.bn_otp = (lb_main_data.bn_otp - 0).toFixed(3);
                        $scope.cdt.last_update = lb_main_data.create_datetime;
                        //test
                        $scope.getLinebalanceView($scope.cdt.id);
                    } else {
                        $scope.cdt.mode = 'insert';
                        $scope.cdt.id = '';
                        $scope.cdt.total_sam = (style_data.total_sam - 0).toFixed(3);
                        $scope.cdt.otp_target = '';
                        $scope.cdt.takttime_plan = '';
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
                        clearGraph();
                        $scope.getCrdateFrLbMainByMax();
                    }
                    hideLoading($ionicLoading);
//                    $scope.$apply();
                }, function () {
                    console.log("getLbMainByCdt ", "ERROR");
                });
            }
            $scope.onChangeStyle = function () {
//                alert()
//                $scope.getLinebalanceView($scope.cdt.line_id);
                //clear form input
                $scope.cdt.mode = '';
                $scope.cdt.id = '';
                $scope.cdt.total_sam = 0;
                $scope.cdt.otp_target = '';
                $scope.cdt.takttime_plan = '';
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
                clearGraph();
                $scope.getLbMainByCdt();
            }
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
//                        hideLoading($ionicLoading);
//                        $scope.cdt.factory_obj = {};
                    }

                }, function () {
                    hideLoading($ionicLoading);
                    console.log("getGsdHeaderByCdt", "ERROR");
                });
            };
//            $scope.getGsdHeaderByCdt = function () {
//                showLoading($ionicLoading);
//                var style_data = angular.fromJson($scope.cdt.style_data);
//                var request = {customer: $scope.cdt.customer, style: style_data.style};
//                getGsdHeaderByCdt(request, function (data) {
//                    console.log("getGsdHeaderByCdt", data);
//                    if (data.errorcode == "OK") {
//                        var gsd_heder = data.data[0];
////                        if (gsd_heder.id){
//                        $scope.cdt.gsd_header_id = gsd_heder.id;
//                        $scope.addLbMain(gsd_heder.id);
////                        }
//                    } else {
//                        hideLoading($ionicLoading);
////                        $scope.cdt.factory_obj = {};
//                    }
//
//                }, function () {
//                    hideLoading($ionicLoading);
//                    console.log("getGsdHeaderByCdt", "ERROR");
//                });
//            };
            $scope.addLbMain = function (gsd_header_id) {
                showLoading($ionicLoading);
//                line_id=?,gsd_header_id=?,takttime_plan=?,otp_target=?
                var request = {line_id: $scope.cdt.line_id, gsd_header_id: gsd_header_id, takttime_plan: $scope.cdt.takttime_plan, otp_target: $scope.cdt.otp_target};
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
            $scope.getMaxSeqLbD = function (line_id) {
                var request = {lb_main_id: line_id, gcode_id: $scope.cdt_dl_as.gcode_id};
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
//                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getMaxSeqLbD", "ERROR");
                });
            }
            $scope.getLinebalanceView = function (lb_main_id, upform_afsave) {
                showLoading($ionicLoading);
                var request = {lb_main_id: lb_main_id};
                getLinebalanceView(request, function (data) {
                    console.log("getLinebalanceView", data);
                    if (data.errorcode == "OK") {
//                        $scope.cdt.lbc_obj = data.data;
//                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
//                            $scope.$apply();
//                        }
//                        $scope.updateChartValue(data.data);
                        if (upform_afsave) {
//                            alert('1');
                            updateFormLbMain(data.data);
                        } else {
//                            alert('2');
                            //เรียงข้อมูลใหม่และเอาข้อมูลที่เรียงแล้วไปsetลงกราฟ

                            $scope.btnOrderDefault(data.data);
                        }
                    } else {
                        $scope.onClickAdd();
//                        $scope.cdt.factory_obj = {};
                    }
                    $scope.cdt.order_status = '0';
                    $scope.$apply();
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getLinebalanceView", "ERROR");
                });
            };
            function updateFormLbMain(data_obj) {
                var lb_main_id = $scope.cdt.id;
                var total_cycletime = 0;
                var max_cycletime = 0;
                var man = data_obj.length;
                //index ของ reccord ที่ cycletime มากสุด
                var index_max_cycle = 0;
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
                var balance = ((total_cycletime * 100) / (max_cycletime * man)).toFixed(3);
                //เอา position_code ที่ cycletime มากสุดมา
                var position_code = data_obj[index_max_cycle].code;
                //เอา emp_code ที่ cycletime มากสุดมา
                var emp_code = data_obj[index_max_cycle].employee;
                var bn_output = 60 / max_cycletime;
                //var bn_eff = (((bn_output * $scope.cdt.total_sam) / (man * 60)) * 100).toFixed(3);    Remark By P.Sirintorn JUN142017

                var bn_eff = parseFloat((((bn_output * $scope.cdt.total_sam) / (man * 60)) * 100).toFixed(3));

                var bn_otp = ((($scope.cdt.takttime_plan) / (max_cycletime * 100))).toFixed(3);
                $scope.cdt.mode = 'update';
//                $scope.cdt.id = lb_main_data.id;
//                $scope.cdt.total_sam = (lb_main_data.total_sam - 0).toFixed(3);
//                $scope.cdt.otp_target = lb_main_data.otp_target;
//                $scope.cdt.takttime_plan = lb_main_data.takttime_plan;
                $scope.cdt.total_cycletime = total_cycletime;
                $scope.cdt.cycletime_max = max_cycletime;
                $scope.cdt.man = man;
                $scope.cdt.percent_balance = balance;
//                $scope.cdt.position_code = position_code;
//                $scope.cdt.emp_code = emp_code;
//                $scope.cdt.bn_position = lb_main_data.bn_position;
//                $scope.cdt.bn_employee = lb_main_data.bn_employee;
                $scope.cdt.bn_output = bn_output;
                $scope.cdt.bn_eff = bn_eff;
                $scope.cdt.bn_otp = bn_otp;
                $scope.updateLbMainByCdt(data_obj);
//                $scope.cdt.last_update = lb_main_data.create_datetime;
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
                    $scope.cdt_dl_lbc.cycletime = sum_time.toString().substr(0, 5);
                    //SET StatusID
                    $scope.setSttIdByCcTTimer();
                    flag_stop = false;
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
                } else if (($scope.cdt_dl_lbc.cycletime - 0) < (takttime_plan * (85 / 100))) {
//                        alert('3');
                    $scope.cdt_dl_lbc.status_id = '5';
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
                angular.forEach(data_obj, function (data, index) {

                    label_ar.push(data.code +' '+ data.employee);
                    data_ar.push(data.cycletime);
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
                                labelString: 'Test'
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
                        borderColor: "rgba(203, 100, 50, 1)",
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


        })
        .controller('Kaizen', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
            var pictureSource;   // picture source
            var destinationType; // sets the format of returned value
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
        //                alert('gsd_header_id = '+$scope.cdt.gsd_header_id);
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
//            $scope.onSelectLine = function () {
//                if ($scope.cdt.line_id) {
//                    //get process name
//                    $scope.getGsdDataByCdn();
//                }
//            }

            $scope.onSelectLine = function () {
                //CLEAR FORM

//                $scope.cdt.ga_detail_obj = [];

                $scope.cdt.style = '';
                $scope.cdt.customer = '';
                $scope.cdt.customer_id = null;

                var line_data = angular.fromJson($scope.cdt.line_data);
                $scope.cdt.line_id = line_data.line_id;
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
                        var before_img = data.data[0].before_byte;
                        var after_img = data.data[0].after_byte;
                        var seq = data.data[0].seq;
                        onSelectBlobBf(before_img);
                        onSelectBlobAf(after_img);
                        $scope.cdt.seq_max = seq;
                        $scope.cdt.before_detail = data.data[0].before_detail;
                        $scope.cdt.after_detail = data.data[0].after_detail;
                        $scope.cdt.corrective_action = data.data[0].corrective_action;
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



        })
        .controller('Kaizen2', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
            function init() {
                $scope.cdt = {};
                $scope.getGsdHeader();
                $scope.cdt_dl_gsd = {};
                $scope.cdt_dl_style = {};
                $scope.cdt_dl_prname = {};
                $scope.getFactory();
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
                    } else {
                        $scope.cdt.factory_obj = [];
                    }
                    hideLoading($ionicLoading);
                }, function () {
                    console.log("getFactory", "ERROR");
                });
            }
            $scope.onChangeFactory = function () {
                showLoading($ionicLoading);
                //clear ddl line
                $scope.cdt.line_id = '';
                $scope.cdt.lbf_obj = [];
                $scope.getLineBuilFac($scope.cdt.factory_id);
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
            $scope.onClickIconCust = function () {
                $scope.cdt_dl_gsd.keyword_cust = '';
                $scope.dialog_gsd_header.show();
            };

            $scope.onClickIconStyle = function () {
                $scope.cdt_dl_style.style_keyword = '';
                $scope.dialog_style.show();
            };
            $scope.onClickRowCust = function (data) {
                $scope.dialog_gsd_header.hide();
                $scope.cdt.customer = data.customer;
                $scope.getGsdHeaderByCust(data.customer);
            }
            $scope.onClickRowStyle = function (data) {
                $scope.cdt.style = data.style;
                $scope.cdt.total_sam = (data.total_sam - 0).toFixed(3);
                $scope.cdt.gsd_header_id = data.id;
                console.log('onClickRowStyle', data);
                $scope.dialog_style.hide();
                //                $scope.getGsdHeaderByCust(data.customer);
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
                if ($scope.cdt.line_id) {
                    //get process name
                    $scope.getGsdDataByCdn();
                }
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
                if (validateAddKaizen()) {
                    var req = {seq: $scope.cdt.seq_max,
                        before_byte: localStorage.getItem("before_img"),
                        before_detail: $scope.cdt.before_detail,
                        after_byte: localStorage.getItem("after_img"),
                        after_detail: $scope.cdt.after_detail,
                        corrective_action: $scope.cdt.corrective_action,
                        gsd_header_id: $scope.cdt.gsd_header_id,
                        line_id: $scope.cdt.line_id,
                        process_name: $scope.cdt.process_name
                    };
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
                if (!$scope.cdt.corrective_action) {
                    msg_validate += (msg_validate != "" ? "<br>" : "") + "Corrective Action";
                }

                if (!$scope.cdt.process_name) {
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

        })
        .controller('GsdAnalysis', function ($state, $scope, $ionicPopup, $ionicModal, $ionicTabsDelegate, $ionicLoading) {
                        var next_idx_group = -1;
                        var next_idx_step = -1;
                        var flag_stop = false;
                        var interval_time;
                        var sum_time = 0.000;
                        var itv_ga_detail = null;
                        var diff = 0.000;

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


                        $scope.onClickNextGroup = function () {
                            //CHECKก่อนว่าnext_idxไม่เกินlength
                            (next_idx_group + 1 > $scope.cdt_dl_timer.group_obj.length ? next_idx_group = 0 : (next_idx_group == -1 ? next_idx_group = 0 : next_idx_group++));
                            $scope.cdt_dl_timer.group_data = $scope.cdt_dl_timer.group_obj[next_idx_group];
                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                                $scope.onChangeGroup();
                            } else {
                                $scope.onChangeGroup();
                            }

                        };
                        $scope.onClickNextStep = function () {
                            console.log('next_idx_step pr', next_idx_step);
                            //CHECKก่อนว่าnext_idxไม่เกินlength
                            (next_idx_step + 1 > $scope.cdt_dl_timer.step_obj.length ? next_idx_step = 0 : (next_idx_step == -1 ? next_idx_step = 0 : next_idx_step++));
                            console.log('next_idx_step af', next_idx_step);
                            $scope.cdt_dl_timer.step_data = $scope.cdt_dl_timer.step_obj[next_idx_step];
                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                                $scope.onChangeStep();
                            } else {
                                $scope.onChangeStep();
                            }
                        };
                        $scope.onChangeGroup = function () {

                            var group_data = angular.fromJson($scope.cdt_dl_timer.group_data);
                            if (group_data) {
                                console.log('group_data', group_data);
                                next_idx_group = group_data.index - 0;
                                var step_ar = [];
                                var idx = 0;
                                angular.forEach($scope.cdt_dl_timer.gsd_detail_obj, function (data_for, index) {
                                    if (data_for.group_id && data_for.group_id == group_data.id) {
                                        data_for.index = idx;
                                        step_ar.push(data_for);
                                        idx++;
                                    }
                                });
                                $scope.cdt_dl_timer.step_obj = step_ar;
                            }
                        };
                        $scope.onChangeStep = function () {
                            var step_data = angular.fromJson($scope.cdt_dl_timer.step_data);
                            if (step_data) {
                                console.log('step_data', step_data);
                                next_idx_step = step_data.index - 0;
                                $scope.cdt_dl_timer.gsd_sam = (step_data.sam_gsd - 0).toFixed(3);
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
                            $scope.getGsdDetailsToGroup();
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
                            var takttime_plan = $scope.cdt.takttime_plan - 0;
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
                                    $scope.cdt.ga_main_id = data_obj.id;
                                    alert("id "+$scope.cdt.ga_main_id+"  iid "+data_obj.id);
                                    $scope.getGaDetail(data_obj.id);
                                    $scope.cdt.total_gsd_sam = parseFloat((data_obj.sam_gsd - 0).toFixed(3));
                                    $scope.cdt.total_cycletime = parseFloat((data_obj.total_cycletime - 0).toFixed(3));
                                    $scope.cdt.sam_header_ratio = parseFloat((data_obj.sam_header_ratio - 0).toFixed(3));
                                    $scope.cdt.revision = (data_obj.revision -0); //Remark By P.Sirintorn JUN202017

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
                            getGaDetail(request, function (data) {
                                console.log("getGaDetail ", data);
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
                                console.log("getGaDetail ", "ERROR");
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
            //                if ($scope.cdt.line_data) {
                            //get process name
            //                    $scope.getGaMainData();
            //                }
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
                            percent_gsdpercent_gsd = ((total_cycletime - 0) - (total_gsd_sam - 0) * 100) / (total_gsd_sam - 0);

                            $scope.cdt.total_gsd_sam = parseFloat(total_gsd_sam.toFixed(3));    //Remark By P.Sirintorn JUN162017
                            $scope.cdt.total_cycletime = parseFloat(total_cycletime.toFixed(3));    //Remark By P.Sirintorn JUN162017
                            $scope.cdt.sam_detail_ratio = parseFloat(((percent_gsd < 0 ? percent_gsd * (-1) : percent_gsd)).toFixed(3));    //Remark By P.Sirintorn JUN162017
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
                            showLoading($ionicLoading);
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

                        $scope.onClickReset = function () {
                            sum_time = 0.000;
                            $scope.cdt_dl_timer.count_time = "0.000";
                            $scope.cdt_dl_timer.cycletime = "0.000";
                            $scope.cdt_dl_timer.status = "";
                            $scope.cdt_dl_timer.sam_detail_ratio = "0.000";
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
                                diff = $scope.cdt_dl_timer.gsd_sam - $scope.cdt_dl_timer.cycletime;
                                status_id = 0;
            //                    OLD CODE BACKUP
            //                    var percent = (($scope.cdt_dl_timer.cycletime - $scope.cdt_dl_timer.gsd_sam) * 100) / $scope.cdt_dl_timer.gsd_sam;
                                var percent = ($scope.cdt_dl_timer.gsd_sam / $scope.cdt_dl_timer.cycletime)*100;      // Remark By P.Sirintorn JUN112017
            //                      var percent = (diff / $scope.cdt_dl_timer.gsd_sam)*100;     Remark By P.Sirintorn JUN132017
                                $scope.cdt_dl_timer.sam_detail_ratio = ((percent < 0 ? percent * (-1) : percent) - 0).toFixed(3);
                                //                    OLD CODE BACKUP
            //                    $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.sam_detail_ratio ? "เกิน" : "ไม่เกิน");
                                $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.gsd_sam ? "เกิน" : "ไม่เกิน");
                                if($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.gsd_sam){
                                    status_id = 10;
                                }else{
                                    status_id = 9;
                                }
                                $scope.cdt.status_id = status_id;
                    //            alert('cycletime '+$scope.cdt_dl_timer.cycletime+' status '+status_id);
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
                                    , gsd_detail_id: ($scope.cdt_dl_timer.ga_detail_id ? '' : step_data.id)
                                    , ga_main_id: ($scope.cdt_dl_timer.ga_detail_id ? '' : $scope.cdt.ga_main_id)
                                    , cycletime: $scope.cdt_dl_timer.cycletime
//                                    , diff: $scope.cdt_dl_timer.gsd_sam - $scope.cdt_dl_timer.cycletime   Remark By P.Sirintorn JUN112017
                                    , diff : diff
                                    , sam_detail_ratio: $scope.cdt_dl_timer.sam_detail_ratio
                                    , status_id: $scope.cdt.status_id}; // Remark By P.Sirintorn JUN202017
            //                    alert($scope.cdt_dl_timer.ga_detail_id);
                                if ($scope.cdt_dl_timer.ga_detail_id) {
                                    updateGaDetailData(request);
                                } else {
                                    addGaDetailData(request);
                                }

                            }

                        }
                        function addGaDetailData(request) {
                            addGaDetails(request, function (data) {
                                console.log("addGaDetails", data);
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
                            updateGaDetails(request, function (data) {
                                console.log("updateGaDetailData", data);
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
                            $scope.cdt_dl_timer.gsd_sam = (row_data.sam_gsd - 0).toFixed(3);
            //                alert(row_data.sam_detail_ratio);
            //                var percent = (diff / $scope.cdt_dl_timer.gsd_sam)*100;        Remark By P.Sirintorn JUN132017
                             var percent = $scope.cdt_dl_timer.sam_detail_ratio = (row_data.sam_detail_ratio - 0).toFixed(3);   // Remark By P.Sirintorn JUN112017
                             $scope.cdt_dl_timer.sam_detail_ratio = (percent - 0).toFixed(3);

                            $scope.cdt_dl_timer.status = ($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.gsd_sam ? "เกิน" : "ไม่เกิน");
                            if($scope.cdt_dl_timer.cycletime > $scope.cdt_dl_timer.gsd_sam){
                                  status_id = 10;
                            }else{
                                  status_id = 9;
                            }
                            $scope.cdt_dl_timer.group_desc = row_data.group_desc;
                            $scope.cdt_dl_timer.description = row_data.description;
                            $scope.dialog_content_timer.show();
                            $scope.cdt_dl_timer.status_id = status_id;
                            setHighlightRow(index);
                            onClickClear();
                        };
                        function validateSaveTimer() {
                            var msg_save = "";
                            if (!$scope.cdt_dl_timer.group_data && !$scope.cdt_dl_timer.ga_detail_id) {
                                msg_save += (msg_save == "" ? "" : ",") + "Group";
                            }
                            if (!$scope.cdt_dl_timer.step_data && !$scope.cdt_dl_timer.ga_detail_id) {
                                msg_save += (msg_save == "" ? "" : ",") + "Step";
                            }
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

                    $scope.getGaMainById = function () {
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

