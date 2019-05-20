var app = angular.module('app', [
    "App.controllers",    
    "App.services",
    "App.Directives",
    "App.constante",
    "ui.router",
    'ui.bootstrap'
]);
//Vista Abstracta ui-router
//https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views
//https://fettblog.eu/gulp-4-parallel-and-series/
//https://bower.io/
// injecting dependencies 
//dashboard : ubold
app.config(function ($stateProvider, $urlRouterProvider, uibDatepickerPopupConfig) {
    // creacion de rutas
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('root', {
            abstract: true,
            views: {
                '@': {
                    templateUrl: 'views/partial/layout.html',                    
                }
                ,
                'navbar@root': {
                    templateUrl: 'views/partial/navbar.html',
                    controller: "navbarController"
                },
                'content@root': {
                    templateUrl: 'views/partial/content.html'                    
                }
                ,
                'footer@root': {
                    templateUrl: 'views/partial/footer.html'  ,      
                    controller: "footerController"            
                }
            }
        })
        .state('root.home', {
            url: '/home',
            templateUrl: 'views/home/index.htm',
            controller: "HomeController"

        })
        .state('root.contact', {
            url: '/contact',            
            templateUrl: 'views/contact/index.htm',            
            controller: 'ContactController'
        })    
        .state('root.about', {
            url: '/about',
            template: "<h1>Signup Page</h1>",
            controller: "AboutCtrl"
        })
        //Login
        .state('login', {
            url: '/login',
            templateUrl: 'views/login/index.htm',
            controller: "LoginController"
        })
        .state('add', {
            url: '/add/:a/:b',
            templateUrl: '/home/resultado.htm',
            controller: 'addController'
        });

    uibDatepickerPopupConfig.closeText = 'Cerrar';
    uibDatepickerPopupConfig.currentText = 'Hoy';
    uibDatepickerPopupConfig.clearText = 'Limpiar';
});