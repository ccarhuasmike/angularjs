var app = angular.module("App.controllers", ['ui-notification']);

app.controller('HomeController', function (
    $scope,
    $state,
    TaskService,
    ParametrosService,
    contMarca,
    HomeService,
    $uibModal,
    Notification) {
    //http://blog.enriqueoriol.com/2016/03/diferencias-servicios-angularjs.html
    //http://plnkr.co/edit/h08qQF2qlVE3arERpdfi?p=preview   -- Notificacion
    // Notification.primary('Primary notification');
    // Notification.error('Error notification');
    // Notification.success('Success notification');
    // Notification.info('Information notification');
    // Notification.warning('Warning notification');
    // Notification({message: 'Primary notification', title: 'Primary notification'});
    // Notification.error({message: 'Error notification 1s', delay: 1000});
    // Notification.error({message: 'Error notification (no timeout)', delay: null});
    // Notification.success({message: 'Success notification 20s', delay: 20000});
    // Notification.error({ message: '<b>Error</b> <s>notification</s>', title: '<i>Html</i> <u>message</u>' });
    //https://github.com/huseyinbabal/token-based-auth-frontend

    $scope.valueFromService = HomeService.helloWorld("User");
    //Paginacion-Inicio        
    $scope.pagination = {}
    $scope.pagination.showpagination = false;
    $scope.pagination.itemsPerPage = 5,
        $scope.pagination.currentPage = 1

    $scope.pageChanged = function (pagination) {
        getInit(pagination);
    };
    //Fin-Inicio

    getInit($scope.pagination);

    function getInit(pagination) {
        TaskService.ListarTask(pagination)
            .then(function (response) {
                if (response._List.length > 0) {
                    $scope.pagination.totalItems = response.totalItems;
                    $scope.listado = response._List;
                    $scope.pagination.showpagination = true;
                } else {
                    $scope.pagination.showpagination = false;
                }
            }, function (error) {
                Notification.error({ message: '<b>Error</b> <s>"' + error + '"</s>', title: '<i>Html</i> <u>message</u>' });
            });
    }

    $scope.BuscarTask = function () {

    }
    $scope.ObtenerTaskPorId = function (eTask) {
        var modal = $uibModal.open({
            templateUrl: 'views/home/modalAgregarTask.htm',
            animation: true,
            resolve: {
                Task: function () {
                    return eTask;
                }
            },
            controller: function ($scope, $uibModalInstance, Task) {
                $scope.dt = new Date();
                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };
                function disabled(data) {
                    var date = data.date,
                        mode = data.mode;
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                }
                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];

                $scope.open1 = function () {
                    $scope.opened = true;
                };

                onInit();
                function onInit() {
                    TaskService.ObtenerTaskPorId(Task._id)
                        .then(function (response) {
                            $scope.tasks = response.data.objectTask;
                            $scope.Listarmarcas = response.data.Listmarcas[0].valor;
                            $scope.ChangeMarca = function () {
                                if ($scope.tasks.marca != null) {
                                    $scope.ListarModelo = $scope.tasks.marca.ListDetalle;
                                } else {
                                    $scope.ListarModelo = [];
                                }
                            };
                            $scope.ListarModelo = $scope.Listarmarcas.find(x => x.descripcionCab == $scope.tasks.marca).ListDetalle;
                            $scope.tasks.marca = { descripcionCab: $scope.tasks.marca };
                            $scope.tasks.modelo = { descripcionDet: $scope.tasks.modelo };

                            $scope.formattedDate = moment($scope.tasks.fecha).format('YYYY-MM-DD');
                        }, function (error) {
                            Notification.error({ message: '<b>Error</b> <s>en la carga Inicial</s>', title: '<i>Error   </i> <u>Mant Persona</u>' });
                        });
                }
                $scope.ok = function (tasks) {
                    if ($scope.userForm.$valid) {
                        $uibModalInstance.close(getObjectTask(true, $scope));
                    }
                    $uibModalInstance.close(tasks);
                }
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        });
        modal.result.then(function (result_entidad) {
            if (result_entidad) {
                $scope.ActualizarTask(result_entidad)
            }
        });
    }

    function getObjectTask(flag, $scope) {
        //flag => false: Registrar
        //flag => true  : actualizar
        var task = {
            "title": $scope.userForm.title.$modelValue,
            "descripcion": $scope.userForm.descripcion.$modelValue,
            "marca": $scope.userForm.marca_id.$modelValue.descripcionCab,
            "modelo": $scope.userForm.modelo_id.$modelValue.descripcionDet,
            "comentario": $scope.userForm.comentario.$modelValue,
            "fecha": $scope.userForm.fecha.$modelValue
        }
        if (flag) {
            task._id = $scope.userForm._id.$modelValue
        }
        return task;
    }
    $scope.ActualizarTask = function (eTask) {
        TaskService.ActualizarTask(eTask, $scope.pagination)
            .then(response => {
                $scope.pagination.totalItems = response.totalItems;
                $scope.listado = response._List;
                Notification.success({ message: 'Se Actualizaron con exito<br>los datos Task<br>', title: 'Mensaje Task' });
                //$state.reload();
            }, function (error) {
                Notification.error({ message: '<b>Error</b> <s>Al actualizar los datos de la persona</s>', title: '<i>Error</i> <u>Mant Persona</u>' });
            });
    }

    $scope.AgregarModalTask = function () {
        var modal = $uibModal.open({
            templateUrl: 'views/home/modalAgregarTask.htm',
            animation: true,
            controller: function ($scope, $uibModalInstance) {
                $scope.tasks = {};
                /*cargar combos */
                ParametrosService.ListaParametros(contMarca)
                    .then(function (response) {
                        $scope.Listarmarcas = response[0].valor;
                    }, function (error) {
                        Notification.error({ message: '<b>Error</b> <s>Al obtener las Marcas</s>', title: '<i>Error</i> <u>Mant Persona</u>' });
                    });
                $scope.tasks.marca = "";

                $scope.ChangeMarca = function () {
                    if ($scope.tasks.marca != null) {
                        $scope.ListarModelo = $scope.tasks.marca.ListDetalle;
                    } else {
                        $scope.ListarModelo = [];
                    }
                };
                $scope.tasks.modelo = "";


                $scope.dt = new Date();
                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };
                function disabled(data) {
                    var date = data.date,
                        mode = data.mode;
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                }
                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];
                $scope.open1 = function () {
                    $scope.opened = true;
                };
                $scope.ok = function () {
                    if ($scope.userForm.$valid) {
                        $uibModalInstance.close(getObjectTask(false, $scope));
                    }
                }
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        });
        modal.result.then(function (result_entidad) {
            if (result_entidad) {
                $scope.AgregarTask(result_entidad)
            }
        });
    }

    $scope.AgregarTask = function (eTask) {
        TaskService.AgregarTask(eTask, $scope.pagination)
            .then(response => {
                $scope.pagination.totalItems = response.totalItems;
                $scope.listado = response._List;
                Notification.success({ message: 'Se registraron con exito<br>los datos Task<br>', title: 'Mensaje Task' });
            }, function (error) {
                Notification.error({ message: '<b>Error</b> <s>Al guardar los datos de la persona</s>', title: '<i>Error</i> <u>Mant Persona</u>' });
            });
    }

    $scope.EliminarTask = function (Id) {
        TaskService.EliminarTask(Id, $scope.pagination)
            .then(response => {
                $scope.pagination.totalItems = response.totalItems;
                $scope.listado = response._List;
                $state.reload();
            }, function (data) {
                Notification.error({ message: '<b>Error</b> <s>Al eliminar los datos de la persona</s>', title: '<i>Error</i> <u>Mant Persona</u>' });
            });
    }

    $scope.ModalEliminarTask = function (id) {
        var modal = $uibModal.open({
            templateUrl: 'views/home/modalEliminarTask.htm',
            animation: true,
            resolve: {
                Id: function () {
                    return id;
                }
            },
            controller: function ($scope, $uibModalInstance, Id) {
                $scope.Id = Id;
                $scope.ok = function (Id) {
                    $uibModalInstance.close(Id);
                }
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        });
        modal.result.then(function (Id) {
            if (Id) {
                $scope.EliminarTask(Id)
            }
        });
    }
});
app.controller('LoginController', function ($state,$rootScope, $scope, $location, $localStorage, Main) {

    $scope.signin = function () {
        var formData = {
            email: $scope.email,
            password: $scope.password
        }

        Main.signin(formData)
            .then(response => {
                debugger;
                if (response.type == false) {
                    alert(response.data)
                } else {
                    $localStorage.token = response.data.token;
                    $state.go("root.home");                    
                }
            }, function (error) {
                Notification.error({ message: '<b>Error</b> <s>Al guardar los datos de la persona</s>', title: '<i>Error</i> <u>Mant Persona</u>' });
            });

        // Main.signin(formData, function (res) {
        //     debugger;
        //     if (res.type == false) {
        //         alert(res.data)
        //     } else {
        //         $localStorage.token = res.data.token;
        //         window.location = "/";
        //     }
        // }, function () {
        //     $rootScope.error = 'Failed to signin';
        // })
    };

    $scope.signup = function () {
        var formData = {
            email: $scope.email,
            password: $scope.password
        }

        Main.save(formData, function (res) {
            if (res.type == false) {
                alert(res.data)
            } else {
                $localStorage.token = res.data.token;
                window.location = "/"
            }
        }, function () {
            $rootScope.error = 'Failed to signup';
        })
    };

    $scope.me = function () {
        Main.me(function (res) {
            $scope.myDetails = res;
        }, function () {
            $rootScope.error = 'Failed to fetch details';
        })
    };

    $scope.logout = function () {
        Main.logout(function () {
            window.location = "/"
        }, function () {
            alert("Failed to logout!");
        });
    };
    $scope.token = $localStorage.token;


});
app.controller('ContactController', function () {
    //alert("ContactController");
});
app.controller('navbarController', function ($state,Main,$scope) {
    //$state.go("root.contact");
    //alert("navbarController");

    $scope.logout = function() {
        Main.logout(function() {
            debugger;            
            $state.go("login");
        }, function() {
            alert("Failed to logout!");
        });
    };

});
app.controller('footerController', function () {
    //alert("footerController");
});

