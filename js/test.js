angular.module('app', [])
.controller('testCtrl', ['$scope', function ($scope) {
    $scope.test = 'SPI (Soul Performance Indicator) Test';
    $scope.score = [];
    $scope.currentQuestion = 0;
    $scope.currentAnswer = {
        answer: null
    };
    $scope.questions = [
    {
        id: 1,
        question: 'ท่านใช้อินเทอเน็ตและสื่อสังคมออนไลน์เพื่อวัตถุประสงค์อะไรมากที่สุด?',
        answers: [
            { text: 'ติดต่อผู้คน', value: 0 },
            { text: 'ใช้เพื่องานอาชีพ', value: 1 },
            { text: 'อ่านข่าว', value: 2 },
            { text: 'หาข้อมูลที่ต้องใช้', value: 3 },
            { text: 'หาความรู้ใหม่ๆ', value: 4 }
        ],
        category: 'wisdom'
    },
    {
        id: 2,
        question: 'เมื่อท่านได้ยินเรื่องใหม่ที่ไม่เคยได้ยิน ท่านมักจะ...',
        answers: [
            { text: 'ไม่ต้องรู้จักมันก็ได้', value: 0 },
            { text: 'รู้ผิวเผินก็พอ', value: 1 },
            { text: 'ให้รู้พอสมควร', value: 2 },
            { text: 'ให้รู้มากๆ', value: 3 },
            { text: 'อยากศึกษาให้รู้จนทะลุปรุโปร่ง', value: 4 }
        ],
        category: 'wisdom'
    },
    {
        id: 3,
        question: 'ในการทำงานอาชีพ ท่านมักจะ...',
        answers: [
            { text: 'มุ่งทำตามระบบที่เคยทำๆมา', value: 0 },
            { text: 'คิดสิ่งใหม่เพื่อแก้ปัญหาที่เกิด', value: 1 },
            { text: 'คิดและลองสิ่งใหม่เป็นครั้งคราว', value: 2 },
            { text: 'คิดและลองสิ่งใหม่เสมอ', value: 3 },
            { text: 'คิดและลองสิ่งใหม่ๆตลอดเวลา แม่แต่เรื่องที่ดูเหลวไหล ', value: 4 }
        ],
        category: 'wisdom'
    },
    {
        id: 4,
        question: 'เวลาที่ท่านแสดงความคิดเห็นกับคนอื่น ท่านชอบ',
        answers: [
            { text: 'ชอบคนเห็นด้วยกับท่านด้วยมติเอกฉันท์', value: 0 },
            { text: 'ชอบการเห็นความคล้ายคลึงกับท่าน', value: 1 },
            { text: 'ชอบการแย้งพอสมควร', value: 2 },
            { text: 'ชอบการแย้งที่มีเหตุผล', value: 3 },
            { text: 'ชอบการแย้งแม้ไม่ต้องมีเหตุผลก็ได้', value: 4 }
        ],
        category: 'wisdom'
    },
    {
        id: 5,
        question: 'ท่านเชื่อในเรื่องพฤติกรรมของคนเราว่า...',
        answers: [
            { text: 'มนุษย์แบ่งเป็นคนดีและคนชั่ว', value: 0 },
            { text: 'มนุษย์ทุกคนล้วนมีข้อดีและข้อเสียผสมๆกัน', value: 1 },
            { text: 'พฤติกรรมมนุษย์เป็นผลจากพันธุกรรมและการเลี้ยงดู', value: 2 },
            { text: 'ศาสนาทำให้คนเป็นคนดีกว่าคนไม่มีศาสนา', value: 3 },
            { text: 'จิตมนุษย์แสนซับซ้อน ยากแท้หยั่งถึง', value: 4 }
        ],
        category: 'wisdom'
    },
    ];
    $scope.progress = { width: (($scope.currentQuestion + 1) / $scope.questions.length * 100) + '%' };

    $scope.nextQuestion = function (answer) {
        if (answer === null) {
            return;
        }
        else {
            $scope.score[$scope.currentQuestion] = answer;
            $scope.currentQuestion++;
            $scope.progress = { width: (($scope.currentQuestion + 1) / $scope.questions.length * 100) + '%' };
            $scope.currentAnswer.answer = null;

            if ($scope.score.length === $scope.questions.length) {
                $scope.finished = true;
            }
        }
    }

    $scope.sum = function (score) {
        var sum = 0;
        for (var i = 0; i < score.length; i++) {
            sum+=score[i];
        }
        return sum;
    }
}]);