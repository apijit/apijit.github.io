angular.module('app', ['chart.js', 'firebase'])
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#DFB53C'],
            responsive: true
        });

        ChartJsProvider.setOptions('Radar', {

        });
    }])
    .controller('resultCtrl', ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
        $scope.data = [
            [89, 759, 538, 222, 46, 9, 5, 5, 0]
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
        var ref = new Firebase('https://intense-torch-1321.firebaseio.com/apijit-test');
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
        var results = [];
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
                // $scope.data[0] = results;
                console.log(results);
            })
        });
    }]);