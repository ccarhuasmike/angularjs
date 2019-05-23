var App = angular.module("App.services", []);
//Serivicios
App.service("HomeService", function () {
    return {
        isAString: function (o) {
            return typeof o == "string" || (typeof o == "object" && o.constructor === String);
        },
        helloWorld: function (name) {
            var result = "Hum, Hello you, but your name is too weird...";
            if (this.isAString(name)) {
                result = "Hello, " + name;
            }
            return result;
        }
    }
});
//Factory
App.factory('ParametrosService', ['$http', '$q', '$log', function ($http, $q, $log) {
    return {
        ListaParametros: function (descripcion) {
            var d = $q.defer();
            $http({
                method: 'get',
                url: '/api/getParametros',
                params: { descripcion }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        }
    }
}]);
App.factory('TaskService', ['$http', '$q', '$log', function ($http, $q, $log) {
    Object.toparams = function ObjecttoParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };

    return {
        ListarTask: function (pagination) {
            var d = $q.defer();
            $http({
                method: 'get',
                url: '/api/getdatos',
                params: { pagination }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        },
        ObtenerTaskPorId: function (Id) {
            var d = $q.defer();
            $http({
                method: 'get',
                url: '/api/getdatosPorId',
                params: { Id: Id }
            }).then(function (response) {
                d.resolve(response);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        },
        ActualizarTask: function (datos, pagination) {

            var objetoDatos = {
                "datos": datos,
                "pagination": pagination
            }
            var d = $q.defer();
            $http({
                method: 'POST',
                url: '/api/editar',
                data: JSON.stringify(objetoDatos),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        },
        EliminarTask: function (Id, pagination) {
            var d = $q.defer();
            $http({
                method: 'POST',
                url: '/api/delete',
                data: JSON.stringify({
                    "Id": Id,
                    "pagination": pagination
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        },
        AgregarTask: function (datos, pagination) {
            var d = $q.defer();
            $http({
                method: 'POST',
                url: '/api/add',
                data: JSON.stringify(
                    {
                        "datos": datos,
                        "pagination": pagination
                    }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
        }
    };
}]);
App.factory('Main', ['$http', '$localStorage','$q', function ($http, $localStorage, $q) {
    debugger;
    var baseUrl = "/api";
    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function getUserFromToken() {
        var token = $localStorage.token;
        var user = {};
        if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;
    }

    var currentUser = getUserFromToken();
    return {
        save: function (data, success, error) {
            $http.post(baseUrl + '/signin', data).success(success).error(error)
        },
        signin: function (data, success, error) {            
            var d = $q.defer();
            $http({
                method: 'POST',
                url: baseUrl + '/authenticate',
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                d.resolve(response.data);
            }, function (error) {
                d.reject(error);
            });
            return d.promise;
            //$http.post(baseUrl + '/authenticate', data).success(success).error(error)
        },
        me: function (success, error) {
            $http.get(baseUrl + '/me').success(success).error(error)
        },
        logout: function (success) {
            changeUser({});
            delete $localStorage.token;
            success();
        }
    };
}
]);