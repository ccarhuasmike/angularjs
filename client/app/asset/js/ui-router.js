var app = angular.module('app', ["ui.router", 'ui.bootstrap', 'ui.bootstrap.modal']);
// define route configurations inside app.config 
// injecting dependencies 
app.config(function ($stateProvider, $urlRouterProvider) {
    // creacion de rutas
    $stateProvider
        .state('/home', {
            url: '/home',
            templateUrl: '/home/index.htm',
            controller: HomeCtrl
        })
        .state('/contact', {
            url: '/contact',
            template: "<h1>Login Page</h1>",
            controller: "ContactCtrl"
        })
        .state('/about', {
            url: '/about',
            template: "<h1>Signup Page</h1>",
            controller: "AboutCtrl"
        })
        .state('add', {
            url: '/add/:a/:b',
            templateUrl: '/home/resultado.htm',
            controller: 'addController'
        });
    $urlRouterProvider.otherwise("/home");
});

function PopupController($scope) {

}

function HomeCtrl($scope, $uibModal, $http) {
    //Listar Persona    
    HomeCtrlInit();
    function HomeCtrlInit() {
        $http({
            method: 'get',
            url: '/api/getdatos'
        }).then(function (response) {
            $scope.listado = response.data;
        }, function (error) {
            console.log(error, 'can not get data.');
        });
    }
    //Metodo Eliminar 
    $scope.btnEliminar = function (id) {
        alert("eliminar")
    }
    $scope.btnGetPorId = function (epersona) {
        var modal = $uibModal.open({
            templateUrl: '/home/modalTemplate.html',
            animation: true,
            resolve: {
                personas: function () {
                    return epersona;
                }
            },
            controller: function ($http, $scope, $uibModalInstance, personas) {
                onInit();
                function onInit() {
                    $scope.tasks =
                        {
                            'id': personas._id,
                            'title': personas.title == undefined ? "" : personas.title,
                            'descripcion': personas.descripcion == undefined ? "" : personas.descripcion
                        };
                }
                $scope.ok = function (tasks) {
                    $uibModalInstance.close(tasks);
                }
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        });
        modal.result.then(function (f) {
            if (f) {
                $scope.btnEditar(f);              
            }
        });
    }
    $scope.btnEditar = function ($scope) {
        $http({
            method: 'POST',
            url: '/api/editar',
            data: Object.toparams($scope),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        }).then(function (response) {            
            if (response.data.result) {
                HomeCtrlInit();
            }           
        }, function (error) {
            console.log(error, 'can not get data.');
        });      
    }
    Object.toparams = function ObjecttoParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };
    $scope.btnGrabar = function () {
        $http({
            method: 'POST',
            url: '/api/add',
            data: Object.toparams($scope),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        }).then(function (response) {
            if (response.data.result) {
                HomeCtrlInit();
            }
        });
    }
    //Redireccionar a otro controlador enviar datos atravez de metodo GET
    // $scope.a = 0;
    // $scope.b = 0;
    // $scope.doAdd = function () {
    //     $state.go('add', {
    //         a: $scope.a,
    //         b: $scope.b
    //     });
    // };
}


app.controller('HomeCtrl', function ($scope, $state, $http, $uibModal) { });
app.controller('ContactCtrl', function () { });
app.controller('AboutCtrl', function () { });
app.controller('addController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.a = 0;
    $scope.b = 0;

    if ($stateParams.a) {
        $scope.a = $stateParams.a;
    }
    if ($stateParams.b) {
        $scope.b = $stateParams.b;
    }
    $scope.resultado = parseInt($scope.a) + parseInt($scope.b);

}]);