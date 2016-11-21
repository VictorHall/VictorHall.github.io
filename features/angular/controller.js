(function() { 'use strict';
  angular.module('webcam').controller('webcamController', webcamController);
  webcamController.$inject = ['$scope', '$log'];
  function webcamController($scope, $log) {
    /* jshint validthis: true */
    var vm = this;
    //Hides loading text
    vm.loading = false;
    //Displays if the request fails
    vm.failed = false;

    
    vm.config = {
      delay: 0,
      shots: 1,
      flashFallbackUrl: 'vendors/webcamjs/webcam.swf',
      shutterUrl: 'shutter.mp3',
      flashNotDetectedText: 'Seu browser não atende os requisitos mínimos para utilização da camera. ' +
      'Instale o ADOBE Flash player ou utilize os browsers (Google Chrome, Firefox ou Edge)'
    };

    vm.showButtons = false;
    vm.captureButtonEnable = false;
    vm.progress = 0;
    

    vm.onCaptureComplete = function(src) {

      $log.log('webcamController.onCaptureComplete : ', src);
      vm.progress = 100;
      var el = document.getElementById('result');
      var img = document.createElement('img');
      img.src = src[vm.config.shots-1];
      img.width = 240;
      img.height = 180;
      el.appendChild(img);
      //Dispalys loading text
      vm.loading = true;
      //Sends image uri to analyze for analysis
      vm.analyze(src);
    };
    vm.onError = function(err) {
      $log.error('webcamController.onError : ', err);
      vm.showButtons = false;
    };
    vm.onLoad = function() {
      $log.info('webcamController.onLoad');
      vm.showButtons = true;
    };
    vm.onLive = function() {
      $log.info('webcamController.onLive');
      vm.captureButtonEnable = true;
    };
    vm.onCaptureProgress = function(src, progress) {     
      vm.progress = progress;
      var result = {
        src: src,
        progress: progress
      }

      var el = document.getElementById('result');
      var img = document.createElement('img');
      img.src = src;
      img.width = 240;
      img.height = 180;
      el.appendChild(img);
      console.log("This is the url: " + result.src);
      $log.info('webcamController.onCaptureProgress : ', result);

    };



    //Sends image to api for analysis
     vm.analyze = function(src) {
        

        //converts to string
        var uri = src.toString();
        //String manipulation
        uri = uri.slice(23, uri.length);
        
        var app = new Clarifai.App(
          'kS3D7ofjZQYiyr_7uET1IemaxIzmnmK3vbX4Vhwt',
          'lvhKWZx9bMY1L0OMVmo9bMr9A9_PyCRgmP2FGvEJ'
        );

        

        // predict the contents of an image by passing in a url
        app.models.predict(Clarifai.GENERAL_MODEL, {base64: uri}).then(
        function(response) {
        //hides loading text  
        vm.loading = false;
        //str returns a string
        var str = response.request.response;
         //converting string to json
        var json = JSON.parse(str);
        //Passes result to the view
        vm.analysis = json.outputs[0].data.concepts;
         //Without $scope.$apply();, angular will not recognize
         //since it's not an Angular lib, so it probably just doesn't run the digest cycle automatically for you in the promise resolve (.then() callback)
         $scope.$apply();
        },
          function(err) {
          console.error(err);
          //Prints out error message
          vm.loading = false;
          //Shows error text
          vm.failed = true;
  
          vm.error = "Opps, something went wrong :( "  + err;
          $scope.$apply();
        }
        );

    };

    vm.capture = function() {
      $scope.$broadcast('ngWebcam_capture'); };
    vm.on = function() {
      $scope.$broadcast('ngWebcam_on');
    };
    vm.off = function() {
      $scope.$broadcast('ngWebcam_off');
      vm.captureButtonEnable = false;
    };
  }
})();