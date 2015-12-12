angular.module('app', ['chart.js', 'firebase'])
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            responsive: true
        });
    }])
    .controller('resultCtrl', ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
        var ref = new Firebase('https://intense-torch-1321.firebaseio.com/apijit-test');
        var results = [];
        var map = {
            '“อปกติจิต” (Abnormal Soul)': 0,
            '“ปกติจิตระดับต่ำ” (Inferior Normal Soul)': 0,
            '“ปกติจิตระดับกลาง” (Average Normal Soul)': 0,
            '“ปกติจิตระดับบน” (Superior Normal Soul)': 0,
            '“อภิจิตระดับพื้นฐาน” (Basic SuperSoul)': 0,
            '“อภิจิตระดับก้าวหน้า” (Advanced SuperSoul)': 0,
            '“อภิจิตระดับสูง” (Superior SuperSoul)': 0,
            '“อภิจิตระดับพิเศษ” (Special SuperSoul)': 0,
            '“อภิจิตระดับเหนือมิติ” (Transcendant SuperSoul)': 0
        };
        $scope.data = [
            [0,0,0,0,0,0,0,0,0]
        ];
        $scope.labels = [
            'อปกติจิต',
            'ปกติจิตระดับต่ำ',
            'ปกติจิตระดับกลาง',
            'ปกติจิตระดับบน',
            'อภิจิตระดับพื้นฐาน',
            'อภิจิตระดับก้าวหน้า',
            'อภิจิตระดับสูง',
            'อภิจิตระดับพิเศษ',
            'อภิจิตระดับเหนือมิติ'
        ];
        var keys = [];

        ref.once('value', function (allSnapshot) {
            allSnapshot.forEach(function (snapshot) {
                var data = snapshot.val();
                map[data.title]++;
            });
            for (var prop in map) {
                results.push(map[prop]);
            }
            $scope.$apply(function () {
                $scope.data[0] = results;
            })
        });
    }]);