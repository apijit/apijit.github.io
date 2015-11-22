angular.module('app', ['chart.js', 'firebase', 'updateMeta'])
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#DFB53C'],
            showTooltips: false,
            responsive: true,
            scaleOverride: true,
            scaleSteps: 10,
            scaleStepWidth: 10,
            scaleStartValue: 0
        });

        ChartJsProvider.setOptions('Radar', {
            pointLabelFontFamily: "'thaisans'",
            pointLabelFontSize: 24,
            pointLabelFontColor: '#DFB53C'
        });
    }])
    .controller('testCtrl', ['$scope', 'Question', '$window', function ($scope, Question, $window) {
        var ref = new Firebase('https://intense-torch-1321.firebaseio.com/');
        var testerRef = ref.child('apijit-test');
        $scope.testStarted = false;
        $scope.test = 'SPI (Soul Performance Indicator) Test';
        $scope.score = {
            'wisdom': [],
            'moral': [],
            'beatitude': [],
            'discipline': [],
            'influence': [],
            'purpose': []
        };
        $scope.currentQuestion = 0;
        $scope.completed = false;
        $scope.finished = false;
        $scope.questions = shuffleArray(Question);
        $scope.questions.forEach(function (question) {
            question.answers = shuffleArray(question.answers);
            return question;
        });
        $scope.progress = {
            width: (($scope.currentQuestion + 1) / $scope.questions.length * 100) + '%'
        };
        $scope.labels = ['ปัญญา', 'จรรยา', 'ปิติ', 'วินัย', 'พลัง', 'สัมฤทธิ์'];
        $scope.categoryTotal = {
            'wisdom': 0,
            'moral': 0,
            'beatitude': 0,
            'discipline': 0,
            'influence': 0,
            'purpose': 0
        };

        $scope.share = function () {
            $window.FB.ui({
                method: 'share_open_graph',
                action_type: 'fbapijit:do',
                action_properties: JSON.stringify({
                    'test': {
                        'og:url': 'http://www.apijitsupersoul.com/test.html',
                        'og:title': 'Testing',
                        'og:type': 'fbapijit:test',
                        'og:image': 'https://fbstatic-a.akamaihd.net/images/devsite/attachment_blank.png',
                        'og:description': 'blahblahblah',
                        'fb:app_id': '522940864521909'
                    }
                })
            }, function (response) {});
        };

        $scope.startTest = function () {
            $scope.testStarted = true;
            console.log('test Start');
        };

        $scope.submitQuestion = function (answer) {
            var question = $scope.questions[$scope.currentQuestion];
            $scope.score[$scope.questions[$scope.currentQuestion].category].push(answer * question.weight);
            $scope.categoryTotal[$scope.questions[$scope.currentQuestion].category] += $scope.questions[$scope.currentQuestion].weight;
            $scope.currentQuestion++;
            if ($scope.currentQuestion === $scope.questions.length) {
                $scope.completed = true;
                return;
            }
            $scope.progress = {
                width: (($scope.currentQuestion + 1) / $scope.questions.length * 100) + '%'
            };
        };

        $scope.submitInfo = function (isValid) {
            if (isValid) {
                $scope.wisdomScore = sum($scope.score.wisdom) / $scope.categoryTotal.wisdom * 100;
                $scope.moralScore = sum($scope.score.moral) / $scope.categoryTotal.moral * 100;
                $scope.beatitudeScore = sum($scope.score.beatitude) / $scope.categoryTotal.beatitude * 100;
                $scope.disciplineScore = sum($scope.score.discipline) / $scope.categoryTotal.discipline * 100;
                $scope.influenceScore = sum($scope.score.influence) / $scope.categoryTotal.influence * 100;
                $scope.purposeScore = sum($scope.score.purpose) / $scope.categoryTotal.purpose * 100;
                $scope.chartData = [
                    [$scope.wisdomScore, $scope.moralScore, $scope.beatitudeScore, $scope.disciplineScore, $scope.influenceScore, $scope.purposeScore]
                ];
                $scope.finalScore = Math.floor(($scope.wisdomScore + $scope.moralScore + $scope.beatitudeScore + $scope.disciplineScore + $scope.influenceScore + $scope.purposeScore) / 6);
                $scope.evaluation = evaluation($scope.finalScore);
                var data = {
                    name: $scope.name,
                    age: $scope.age,
                    averageScore: $scope.finalScore,
                    wisdomScore: $scope.wisdomScore,
                    moralScore: $scope.moralScore,
                    beatitudeScore: $scope.beatitudeScore,
                    disciplineScore: $scope.disciplineScore,
                    influenceScore: $scope.influenceScore,
                    purposeScore: $scope.purposeScore,
                    title: $scope.evaluation.type
                }
                if ($scope.email) {
                    data.email = $scope.email;
                }
                testerRef.push(data);
                $scope.ogtitle = $scope.evaluation.type;
                $scope.completed = false;
                $scope.finished = true;
            } else {
                $scope.errorMessage = 'กรุณาใส่ข้อมูลให้ครบ';
            }
        }

        function sum(score) {
            var sum = 0;
            for (var i = 0; i < score.length; i++) {
                sum += score[i];
            }
            return sum;
        }

        function shuffleArray(array) {
            var m = array.length,
                t, i;

            // While there remain elements to shuffle
            while (m) {
                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            return array;
        }

        function evaluation(totalScore) {
            var result = {
                type: '',
                description: ''
            };
            if (totalScore <= 35) {
                result.type = '“อปกติจิต” (Abnormal Soul)';
                result.description = 'คุณมีภาวะจิตที่เริ่มผิดปกติ ยากที่จะดำเนินชีวิตอย่างปกติสุขและมีประสิทธิภาพ ปรับตัวยาก พัฒนาตัวยาก ทั้งมีความเสี่ยงที่จะมีอาการรุนแรงขึ้น จึงควรรีบพัฒนาโดยด่วน หรือปรึกษาแพทย์';
            } else if (totalScore <= 50) {
                result.type = '“ปกติจิตระดับต่ำ” (Inferior Normal Soul)';
                result.description = 'คุณสามารถดำเนินชีวิตดูแลตัวเองได้ แต่ไม่ค่อยมีประสิทธิภาพมากนัก ควรมีการพัฒนาเพื่อให้มีประสิทธิภาพสูงขึ้นอีก';
            } else if (totalScore <= 60) {
                result.type = '“ปกติจิตระดับกลาง” (Average Normal Soul)';
                result.description = 'คุณมีภาวะปกติจิต สามารถดำเนินชีวิตอย่างมีประสิทธิภาพได้ อย่างไรก็ตามคุณยังมีความสุขและมีประสิทธิภาพได้มากขึ้นอีก หากมีการพัฒนาอย่างต่อเนื่อง';
            } else if (totalScore <= 70) {
                result.type = '“ปกติจิตระดับสูง” (Superior Normal Soul)';
                result.description = 'คุณมีภาวะปกติจิตและยังมีโอกาสก้าวสู่ระดับอภิจิต คุณมีความสามารถและมีสุขภาพจิตที่ดี แต่คุณยังมีโอกาสพัฒนาไปได้ไกลกว่านี้อีก หากมีวิธีพัฒนาที่ดี';
            } else if (totalScore <= 80) {
                result.type = '“อภิจิตระดับพื้นฐาน” (Basic SuperSoul)';
                result.description = 'คุณอยู่ในขั้นเริ่มต้นของการมีภาวะอภิจิต ในการเป็นคนที่เก่ง ดี มีความสุข ดีทั้งสติปัญญาและอารมณ์ ยังมีโอกาสไปได้ไกลกว่านี้อีกมาก หากมีวิธีพัฒนาที่ดี';
            } else if (totalScore <= 85) {
                result.type = '“อภิจิตระดับก้าวหน้า” (Advanced SuperSoul)';
                result.description = 'คุณมีภาวะอภิจิตที่เก่งคิดฉลาดทำ เป็นคนดี มีความสุข มีพลัง มีเป้าหมายชีวิต และมุ่งมั่นสูง จนเห็นได้ชัด';
            } else if (totalScore <= 90) {
                result.type = '“อภิจิตระดับสูง” (Superior SuperSoul)';
                result.description = 'คุณมีภาวะอภิจิตที่เก่งคิดฉลาดทำ เป็นคนดี มีความสุข มีพลัง มีเป้าหมายชีวิต เห็นได้ชัดว่ามีความมุ่งมั่นสูง อดทนเป็นเลิศ แรงจูงใจใฝ่สัมฤทธิ์แรงชัดมาก ไม่ยอมพ่ายแพ้ต่ออุปสรรค มีความเป็นผู้นำสูง มีอิทธิพลต่อชีวิตคนรอบข้าง';
            } else if (totalScore <= 95) {
                result.type = '“อภิจิตระดับพิเศษ” (Special SuperSoul)';
                result.description = 'คุณเป็นบุคคลที่หาได้ยาก สร้างสรรค์สิ่งใหม่ มีความมุ่งมั่นสูง ความเป็นผู้นำความโดดเด่นเพิ่มมากขึ้นอีก เป้าหมายชีวิตสูงมาก และบากบั่นอย่างหนักเพื่อความสัมฤทธิ์ผล ไม่ยอมพ่ายแพ้แก่อุปสรรคใดๆ';
            } else if (totalScore <= 100) {
                result.type = '“อภิจิตระดับเหนือมิติ” (Transcendant SuperSoul)';
                result.description = 'คุณเป็นบุคคลที่หาได้ยากยิ่ง ที่ทำให้คนธรรมดาๆ คนหนึ่งกลายเป็นยอดคน มีสภาวะ SuperSoul ที่ทำให้กลายเป็น Superman มีจิตใจอันยิ่งใหญ่กว่าคนทั่วไปมาก ทำสิ่งที่เหลือเชื่อได้สำเร็จอย่างอัศจรรย์ สามารถพลิกวิกฤตได้ ช่วยเหลือผู้อื่นได้มากมาย เป็นผู้นำที่มีอิทธิพลทางจิตใจต่อคนอื่นๆ มากมาย ผู้คนให้ความรักและศรัทธาอย่างยิ่ง เป็นคนที่แม้วันที่จากไปแล้วก็ยังจะเป็นแรงบันดาลใจให้ผู้คน';
            }
            return result;
        }
    }])
    .factory('Question', function () {
        var questions = [{
            id: 1,
            question: 'คุณใช้อินเตอร์เน็ตและสื่อสังคมออนไลน์เพื่อวัตถุประสงค์อะไรมากที่สุด?',
            answers: [{
                text: 'ติดต่อผู้คน',
                value: 0
            }, {
                text: 'ใช้เพื่องานอาชีพ',
                value: 0.25
            }, {
                text: 'อ่านข่าว',
                value: 0.5
            }, {
                text: 'หาข้อมูลที่ต้องใช้',
                value: 0.75
            }, {
                text: 'หาความรู้ใหม่ๆ',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 2,
            question: 'เมื่อคุณได้ยินเรื่องใหม่ที่ไม่เคยได้ยินมาก่อน คุณมักจะคิดว่า...',
            answers: [{
                text: 'ไม่ต้องรู้มันก็ได้',
                value: 0
            }, {
                text: 'รู้ผิวเผินก็ดี',
                value: 0.25
            }, {
                text: 'อยากรู้พอสมควร',
                value: 0.5
            }, {
                text: 'อยากรู้มากๆ',
                value: 0.75
            }, {
                text: 'อยากศึกษาให้รู้จนทะลุปรุโปร่ง',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 3,
            question: 'ในการทำงานอาชีพ คุณมักจะ...',
            answers: [{
                text: 'มุ่งทำตามระบบที่เคยทำๆมา',
                value: 0
            }, {
                text: 'คิดสิ่งใหม่เพื่อแก้ปัญหาที่เกิด',
                value: 0.25
            }, {
                text: 'คิดและลองสิ่งใหม่เป็นครั้งคราว',
                value: 0.5
            }, {
                text: 'คิดและลองสิ่งใหม่เสมอ',
                value: 0.75
            }, {
                text: 'คิดและลองสิ่งใหม่ๆตลอดเวลา แม้แต่เรื่องที่ดูเหลวไหล ',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 4,
            question: 'ปกติคุณคิดเรื่องต่างๆด้วยมุมมองอย่างไร',
            answers: [{
                text: 'ตามมุมมองที่คนทั่วไปมอง',
                value: 0
            }, {
                text: 'ตามมุมมองที่ตนเองคุ้นเคย',
                value: 0.1
            }, {
                text: 'ตามมุมมองตนเองและคนใกล้ชิด',
                value: 0.5
            }, {
                text: 'ตามมุมมองตนเองและมุมมองที่แตกต่าง',
                value: 0.75
            }, {
                text: 'มองจากกลากหลายแทบทุกมุมมอง',
                value: 1
            }],
            category: 'wisdom',
            weight: 2
        }, {
            id: 5,
            question: 'คุณเชื่อในเรื่องพฤติกรรมของคนเราว่า...',
            answers: [{
                text: 'มนุษย์แบ่งเป็นคนดีและคนชั่ว',
                value: 0
            }, {
                text: 'มนุษย์ทุกคนล้วนมีข้อดีและข้อเสียผสมๆกัน',
                value: 0.25
            }, {
                text: 'พฤติกรรมมนุษย์เป็นผลจากพันธุกรรมและการเลี้ยงดู',
                value: 0.5
            }, {
                text: 'ศาสนาทำให้คนเป็นคนดีกว่าคนไม่มีศาสนา',
                value: 0.5
            }, {
                text: 'จิตมนุษย์แสนซับซ้อน ยากแท้หยั่งถึง',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 6,
            question: 'เวลาที่คุณต้องร่วมพิธีทางศาสนา  คุณสังเกตตัวเองได้ว่า...',
            answers: [{
                text: 'ทำไป ไม่ต้องคิดอะไรมาก ใครๆเขาก็ทำ',
                value: 0
            }, {
                text: 'ทำไป เห็นแก่ประเพณีและเจ้าภาพ',
                value: 0.25
            }, {
                text: 'ทำไป ไม่เชื่อก็เก็บไว้ในใจ',
                value: 0.5
            }, {
                text: 'ถ้าไม่เชื่อจะไม่ทำ ต้องเชื่อจริงถึงจะทำ',
                value: 0.75
            }, {
                text: 'ทำเฉพาะบางส่วนที่เชื่อ เพื่อมารยาทสังคม',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 7,
            question: 'เวลาดูข่าวสารหรือรายการต่างๆทางสื่อ คุณคิดกับตัวเองว่า',
            answers: [{
                text: 'รายการนี้สนุกดี',
                value: 0
            }, {
                text: 'รายการนี้เขาเก่ง',
                value: 0
            }, {
                text: 'เขามีโฆษณาเยอะไหม อะไรบ้าง?',
                value: 0
            }, {
                text: 'เขามีแนวคิดและหลักการอะไร',
                value: 0.75
            }, {
                text: 'ทำไมสังคมถึงสนใจเรื่องอย่างนี้?',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 8,
            question: 'คุณเคยเรียบเรียงความรู้อย่างเป็นระบบ และสรุปมาเป็นบทความ บทเรียนหรือสื่อเพื่อสอนต่อให้คนอื่นได้',
            answers: [{
                text: 'ไม่เคย',
                value: 0
            }, {
                text: 'นานๆที',
                value: 0.25
            }, {
                text: 'มีบ้าง',
                value: 0.5
            }, {
                text: 'มีมาก',
                value: 0.75
            }, {
                text: 'เป็นประจำ',
                value: 1
            }],
            category: 'wisdom',
            weight: 1
        }, {
            id: 9,
            question: 'คุณศึกษาข้อมูลจากแหล่งใดบ้าง',
            answers: [{
                text: 'ถามคนใกล้ตัวเอา',
                value: 0
            }, {
                text: 'จากรายการทีวีต่างๆ',
                value: 0.25
            }, {
                text: 'จากหลายๆแหล่งที่เป็นภาษาไทย',
                value: 0.5
            }, {
                text: 'จากหลายแหล่งหลายภาษาทั่วโลกผ่านเว็ป',
                value: 0.75
            }, {
                text: 'จากหลายแหล่งหลายภาษาทั่วโลกผ่านเว็ปและหนังสือ',
                value: 1
            }],
            category: 'wisdom',
            weight: 4
        }, {
            id: 10,
            question: 'คุณชอบอ่านข่าวสารประเภทใด',
            answers: [{
                text: 'บันเทิง-กีฬา-การ์ตูน',
                value: 0
            }, {
                text: 'ความรู้ที่ใช้ทำงาน',
                value: 0.25
            }, {
                text: 'การเมือง-เศรษฐกิจ',
                value: 0.5
            }, {
                text: 'ปรัชญา-ธรรมะ',
                value: 0.75
            }, {
                text: 'อ่านมันทุกอย่าง ไม่เลือก',
                value: 1
            }],
            category: 'wisdom',
            weight: 2
        }, {
            id: 11,
            question: 'เวลาที่คุณขัดแย้งกับคนอื่น สิ่งที่คุณพยายามทำมากที่สุดคือ',
            answers: [{
                text: 'ทำอย่างไรจึงจะชนะในปัญหานี้',
                value: 0
            }, {
                text: 'ทำอย่างไรเราจึงจะไม่เสียประโยชน์เลย',
                value: 0.1
            }, {
                text: 'พยายามจบความขัดแย้งโดยเราเสียประโยชน์น้อยที่สุด',
                value: 0.25
            }, {
                text: 'พยายามรักษาความสัมพันธ์โดยหาจุดที่ทุกฝ่ายพอรับได้',
                value: 0.75
            }, {
                text: 'พยายามรักษาความยุติธรรมให้แก่คนที่เป็นคู่ขัดแย้งกับเรา',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 12,
            question: 'ระหว่างการเป็นคนดีกับการมีความสุข คุณเลือกอะไรมากกว่า',
            answers: [{
                text: 'ความสุขสำคัญที่สุด',
                value: 0
            }, {
                text: 'ทั้งสุขทั้งดี',
                value: 0.5
            }, {
                text: 'เป็นคนดีสำคัญกว่า',
                value: 0.75
            }, {
                text: 'ยอมทนทุกข์เพื่อความเป็นคนดี',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 13,
            question: 'คุณอ่านหรือคาดการณ์ความรู้สึกของคนอื่นได้ดีเพียงใด',
            answers: [{
                text: 'ไม่แคร์นะ',
                value: 0
            }, {
                text: 'ก็ใส่ใจบ้าง แต่ไม่รู้ว่าคนอื่นเขาจะคิดยังไง',
                value: 0.25
            }, {
                text: 'ถ้าเห็นสีหน้าก็พอรู้',
                value: 0.5
            }, {
                text: 'เข้าใจและใส่ใจความรู้สึก',
                value: 0.75
            }, {
                text: 'อ่านและคาดการณ์ความรู้สึกคนอื่นได้แม่นมาก',
                value: 1
            }],
            category: 'moral',
            weight: 2
        }, {
            id: 14,
            question: 'คุณคิดอย่างไรกับคำว่า "เสียสละตัวเอง"',
            answers: [{
                text: 'จะช่วยใครได้ก็ต้องเอาตัวรอดให้ได้ก่อน',
                value: 0
            }, {
                text: 'ช่วยตัวเองให้มากและช่วยคนอื่นบ้างเป็นบางส่วน',
                value: 0.25
            }, {
                text: 'ก็ต้องพอดี เห็นแก่ตัวเองด้วย เห็นแก่คนอื่นด้วย',
                value: 0.5
            }, {
                text: 'คนดีต้องเสียสละ',
                value: 0.75
            }, {
                text: 'เราต้องเสียสละเพื่อคนส่วนใหญ่',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 15,
            question: 'เวลาที่คุณพบว่าคนที่ทำให้คุณเจ็บกลับเจริญขึ้นเรื่อยๆ คุณรู้สึกอย่างไร?',
            answers: [{
                text: 'ฟ้าไม่ยุติธรรม',
                value: 0
            }, {
                text: 'วันหนึ่งเขาจะต้องได้รับผลกรรมแน่',
                value: 0
            }, {
                text: 'ช่างมัน เราทำชีวิตของเราให้ดีก็แล้วกัน',
                value: 0.5
            }, {
                text: 'เขาอาจมีส่วนดีหลายอย่าง จึงทำให้เขาเจริญ',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 16,
            question: 'เวลาทานอาหาร คุณมีหลักการเลือกร้านหรือเลือกอาหารอย่างไร',
            answers: [{
                text: 'เลือกที่เราชอบ',
                value: 0
            }, {
                text: 'ดูว่าใครจ่ายก็คนเลือก',
                value: 0.25
            }, {
                text: 'คนส่วนใหญ่อยากทานอะไร',
                value: 0.5
            }, {
                text: 'ดูทั้งคนส่วนใหญ่และความสมเหตุสมผลด้วย',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 17,
            question: 'ความดีมีคุณค่าอะไรสำหรับคุณ',
            answers: [{
                text: 'ทำให้ได้รับสิ่งตอบแทน',
                value: 0
            }, {
                text: 'ทำให้คนชื่นชอบ',
                value: 0.25
            }, {
                text: 'ทำให้สังคมยอมรับ',
                value: 0.5
            }, {
                text: 'ทำให้ได้บุญ',
                value: 0.75
            }, {
                text: 'ทำให้บรรลุอุดมคติ',
                value: 1
            }],
            category: 'moral',
            weight: 2
        }, {
            id: 18,
            question: 'เวลาที่คุณเห็นคนถูกเอาเปรียบ คุณมักทำอย่างไร',
            answers: [{
                text: 'ไม่เกี่ยวไม่ยุ่ง',
                value: 0
            }, {
                text: 'เก็บไว้เป็นบทเรียนชีวิต',
                value: 0.25
            }, {
                text: 'รู้สึกเจ็บปวดแทน',
                value: 0.5
            }, {
                text: 'ไปให้กำลังใจคนถูกเอาเปรียบ',
                value: 0.75
            }, {
                text: 'ไปช่วยดำเนินการกับคนเอาเปรียบ',
                value: 1
            }],
            category: 'moral',
            weight: 4
        }, {
            id: 19,
            question: 'มาตรฐานความดีที่คุณยึดถือและใช้อยู่คืออย่างไร',
            answers: [{
                text: 'ใครดีมาฉันดีตอบ ใครร้ายมาฉันร้ายตอบ',
                value: 0
            }, {
                text: 'ฉันไม่ทำร้ายใคร',
                value: 0.25
            }, {
                text: 'ฉันไม่แก้แค้นใคร',
                value: 0.5
            }, {
                text: 'ฉันไม่ทำความชั่ว',
                value: 0.75
            }, {
                text: 'ฉันจะไม่ให้ความบาปชนะฉันทั้งกาย วาจาและใจ',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 20,
            question: 'เวลาที่มีคนไม่ชอบคุณ คุณมักจะทำอย่างไร',
            answers: [{
                text: 'ตาต่อตา ฟันต่อฟัน',
                value: 0
            }, {
                text: 'หาทางหลีกเลี่ยงคนนั้น',
                value: 0.25
            }, {
                text: 'อดทนกันไป',
                value: 0.75
            }, {
                text: 'ทำศัตรูให้กลายเป็นมิตร',
                value: 1
            }],
            category: 'moral',
            weight: 1
        }, {
            id: 21,
            question: 'เวลาคุณหงุดหงิด มีเรื่องไม่พอใจ หรือไม่สบายใจ คุณทำอย่างไร',
            answers: [{
                text: 'หาทางระบายออกมาให้หมด',
                value: 0
            }, {
                text: 'เก็บไว้ในใจ',
                value: 0.25
            }, {
                text: 'ทำใจ อดทนอดกลั้นไว้',
                value: 0.5
            }, {
                text: 'หาทางแก้',
                value: 0.75
            }, {
                text: 'มองให้เห็นแง่ดี และแก้ไข',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 22,
            question: 'เวลามีคนทำให้เจ็บช้ำน้ำใจ คุณมักตอบสนองอย่างไร',
            answers: [{
                text: 'ไปลงนรกเสียเถอะ',
                value: 0
            }, {
                text: 'เจ็บนี้อีกนาน เจ็บนี้ไม่ลืม',
                value: 0
            }, {
                text: 'ปลงอนิจจัง',
                value: 0.5
            }, {
                text: 'เอ หรือว่าเราผิดด้วย',
                value: 0.75
            }, {
                text: 'ให้อภัยแล้วมองหาเหตุผลว่าทำไมเขาทำอย่างนั้น',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 23,
            question: 'ยามเมื่อประสบวิกฤติชีวิต คุณคิดอย่างไร',
            answers: [{
                text: 'โลกนี้ช่างโหดร้าย',
                value: 0
            }, {
                text: 'สัตว์โลกเป็นไปตามกรรม',
                value: 0.25
            }, {
                text: 'มีสิ่งศักดิ์สิทธิ์คอยช่วยเราอยู่',
                value: 0.5
            }, {
                text: 'ชั่วเจ็ดทีดีเจ็ดหน',
                value: 0.75
            }, {
                text: 'ชีวิตไม่สิ้นดิ้นกันไป',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 24,
            question: 'คุณคิดว่าครอบครัวรักคุณแค่ไหน',
            answers: [{
                text: 'ไม่เกี่ยวข้องกัน',
                value: 0
            }, {
                text: 'ต่างคนต่างอยู่',
                value: 0
            }, {
                text: 'รักและหวังดี',
                value: 0.5
            }, {
                text: 'อบอุ่น',
                value: 0.75
            }, {
                text: 'รักสุดๆ',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 25,
            question: 'หากคุณไม่มีเพื่อนฝูง และไม่มีครอบครัว  คุณจะรู้สึกอย่างไร',
            answers: [{
                text: 'อยู่ไม่ได้',
                value: 0
            }, {
                text: 'เหงาเกินไป หาเพื่อนใหม่ ครอบครัวใหม่',
                value: 0.25
            }, {
                text: 'หาอะไรทำเพลิน ไม่คิดมาก',
                value: 0.5
            }, {
                text: 'อยู่คนเดียวก็ได้ สบายดี',
                value: 0.75
            }, {
                text: 'อยู่ได้ทุกสถานการณ์ ไม่ว่ายังไง',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 26,
            question: 'เวลาเครียด คุณสามารถทำให้ใจสงบได้ภายในระยะเวลานานเท่าใด',
            answers: [{
                text: 'ทำใจให้สงบยากมาก',
                value: 0
            }, {
                text: 'เร็วช้าแล้วแต่สถานการณ์',
                value: 0.25
            }, {
                text: 'หนักหนาแค่ไหนสงบได้ในหนึ่งวัน',
                value: 0.5
            }, {
                text: 'ภายใน 2 ชั่วโมง',
                value: 0.75
            }, {
                text: 'ภายใน 15 นาที',
                value: 1
            }],
            category: 'beatitude',
            weight: 2
        }, {
            id: 27,
            question: 'คุณดำเนินชีวิตอยู่เพื่อความสุขทางกายหรือสุขทางใจมากกว่า',
            answers: [{
                text: 'ถ้ากายสุข ใจก็สุขตามมาเอง',
                value: 0
            }, {
                text: 'เอาสุขกายมากกว่าสุขใจดีกว่า',
                value: 0.25
            }, {
                text: 'ก็เอาทั้งกายใจไปพร้อมๆกัน',
                value: 0.5
            }, {
                text: 'สุขใจสำคัญกว่าสุขกาย',
                value: 0.75
            }, {
                text: 'สุขใจสำคัญที่สุด',
                value: 1
            }],
            category: 'beatitude',
            weight: 4
        }, {
            id: 28,
            question: 'คุณมีศีลหรือหลักคุณธรรมประจำใจ ที่ยืดถือปฏิบัติอย่างเคร่งครัดหรือไม่',
            answers: [{
                text: 'ไม่มี',
                value: 0
            }, {
                text: 'แค่ยึดหลักไม่ทำให้ใครเดือดร้อน',
                value: 0.25
            }, {
                text: 'ถือศีลศาสนาหรือหลักคุณธรรมแต่ไม่เคร่งนัก',
                value: 0.5
            }, {
                text: 'ถืดศีลหรือหลักคุณธรรมเคร่งระดับหนึ่ง',
                value: 0.75
            }, {
                text: 'ถือศีลหรือหลักคุณธรรมเคร่งครัดชัดเจน ไม่บ่ายเบี่ยง',
                value: 1
            }],
            category: 'beatitude',
            weight: 2
        }, {
            id: 29,
            question: 'เวลาคุณช่วยเหลือคนเรื่องเงิน  คุณช่วยเขาโดย',
            answers: [{
                text: 'หวังผลตอบแทน',
                value: 0
            }, {
                text: 'ให้จำความดีเราได้บ้างก็พอ',
                value: 0.25
            }, {
                text: 'ช่วยไปก็ดี จะได้บุญ',
                value: 0.5
            }, {
                text: 'ช่วยไปก็ดี ทำให้เกิดความสบายใจ',
                value: 0.75
            }, {
                text: 'ช่วยไปเพราะอยากช่วย ไม่หวังอะไรตอบแทน',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 30,
            question: 'คุณสามารถอดกลั้นความต้องการต่างๆ เพื่อให้บรรลุความสำเร็จได้มากเพียงใด',
            answers: [{
                text: 'ไม่จำเป็นต้องอดกลั้นอะไร',
                value: 0
            }, {
                text: 'รอไม่ค่อยได้',
                value: 0.25
            }, {
                text: 'อดกลั้นตามสถานการณ์',
                value: 0.5
            }, {
                text: 'อดทนได้มาก',
                value: 0.75
            }, {
                text: 'อดทนได้เสมอ',
                value: 1
            }],
            category: 'beatitude',
            weight: 1
        }, {
            id: 31,
            question: 'คุณเชื่อว่าใครเป็นผู้กุมชะตาชีวิตของคุณ',
            answers: [{
                text: 'กรรมเก่าหรือสิ่งศักดิ์สิทธิ์',
                value: 0
            }, {
                text: 'โชคหรือดวง',
                value: 0
            }, {
                text: 'ตัวเรา สิ่งแวดล้อม และโชค',
                value: 0.5
            }, {
                text: 'อยู่ที่เราและโชค',
                value: 0.75
            }, {
                text: 'อยู่ที่เราล้วนๆ',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 32,
            question: 'คุณจัดการนิสัยเสียของตัวเองได้มากแค่ไหน',
            answers: [{
                text: 'ไม่ค่อยได้',
                value: 0
            }, {
                text: 'พอดีไม่ค่อยมีนิสัยเสียขนาดที่ต้องแก้',
                value: 0.25
            }, {
                text: 'แก้ได้พอสมควร',
                value: 0.5
            }, {
                text: 'แก้ได้มาก',
                value: 0.75
            }, {
                text: 'สร้างนิสัยดีแก้นิสัยเสียได้หมด',
                value: 1
            }],
            category: 'discipline',
            weight: 2
        }, {
            id: 33,
            question: 'สิ่งแวดล้อมและคนอื่นๆจูงใจคุณได้มากแค่ไหน',
            answers: [{
                text: 'ฉันเชื่อเรื่องเข้าเมืองตาหลิ่วก็หลิ่วตาตาม',
                value: 0
            }, {
                text: 'ฉันพยายามตามใจทุกคน',
                value: 0.25
            }, {
                text: 'ฉันเป็นตัวของตัวเองพอสมควร',
                value: 0.5
            }, {
                text: 'ฉันมักเป็นฝ่ายจูงใจคนอื่น',
                value: 0.75
            }, {
                text: 'คนอื่นมักจะตามสิ่งที่ฉันพูด',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 34,
            question: 'คุณป่วยง่าย-เหน็ดเหนื่อยง่ายเพียงใด และกระทบต่อภารกิจเพียงใด',
            answers: [{
                text: 'สุขภาพฉันค่อนข้างมีปัญหาและทำให้เสียงาน',
                value: 0
            }, {
                text: 'สุขภาพใช้ได้แต่ไม่ค่อยสดชื่น',
                value: 0.25
            }, {
                text: 'ต้องพักผ่อนมากหน่อยก็จะสู้ได้',
                value: 0.5
            }, {
                text: 'ฉันดูแลตัวเองได้ดีไม่มีปัญหา',
                value: 0.75
            }, {
                text: 'สุขภาพหนักหนายังไงฉันก็สู้ได้',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 35,
            question: 'สิ่งเหนือธรรมชาติเกิดขึ้นกับคุณบ้างไหม',
            answers: [{
                text: 'ไม่เคยเกิดกับฉัน',
                value: 0
            }, {
                text: 'เคยเกิด แต่มีน้อยมาก',
                value: 0.25
            }, {
                text: 'มีเป็นครั้งคราว',
                value: 0.5
            }, {
                text: 'พบเรื่อย',
                value: 0.75
            }, {
                text: 'พบบ่อยมากจนคนอื่นทัก',
                value: 1
            }, ],
            category: 'discipline',
            weight: 1
        }, {
            id: 36,
            question: 'คุณสามารถฝืนเอาชนะความอ่อนแอทางสุขภาพร่างกายและความเจ็บป่วยได้เสมอ',
            answers: [{
                text: 'ป่วยทีไร ทำอะไรไม่ได้เลย',
                value: 0
            }, {
                text: 'ฝืนได้บ้างแต่น้อย',
                value: 0.25
            }, {
                text: 'ชนะได้เป็นครั้งคราว',
                value: 0.5
            }, {
                text: 'ค่อนข้างฝืนได้',
                value: 0.75
            }, {
                text: 'ได้จนเป็นปกติ',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 37,
            question: 'คุณมีปมด้อยหรือความหวาดกลัวอะไรไหม และจัดการอย่างไร',
            answers: [{
                text: 'มีมากและมันส่งผลเสียต่อชีวิต',
                value: 0
            }, {
                text: 'มีน้อยและแสดงออกมาเป็นบางที',
                value: 0.25
            }, {
                text: 'มีแต่ควบคุมไว้ได้',
                value: 0.5
            }, {
                text: 'มีแต่เราสร้างปมเด่นทดแทนปมด้อย',
                value: 0.75
            }, {
                text: 'ไม่มีเราจัดการจนหายหมดแล้ว',
                value: 1
            }],
            category: 'discipline',
            weight: 4
        }, {
            id: 38,
            question: 'คุณเป็นคนขยันหรือทุ่มเทในงานไหม ',
            answers: [{
                text: 'ยอมรับว่าไม่',
                value: 0
            }, {
                text: 'ชอบชิลๆ มากกว่า',
                value: 0.25
            }, {
                text: 'ทำตามหน้าที่รับผิดชอบ',
                value: 0.5
            }, {
                text: 'ขยันใช้ได้',
                value: 0.75
            }, {
                text: 'ทุ่มเทมาก ทำอะไรต้องให้สำเร็จ',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 39,
            question: 'คุณสามารถแก้นิสัยและบุคลิกภาพที่ไม่ดีที่เป็นมาตั้งแต่เด็กหรือวัยรุนได้',
            answers: [{
                text: 'แก้ไม่ได้หรือแก้ได้น้อย',
                value: 0
            }, {
                text: 'แก้ได้บ้าง',
                value: 0.25
            }, {
                text: 'แก้ได้พอสมควร',
                value: 0.5
            }, {
                text: 'แก้ได้มาก',
                value: 0.75
            }, {
                text: 'แก้ได้อย่างกับเป็นคนละคนเลย',
                value: 1
            }],
            category: 'discipline',
            weight: 1
        }, {
            id: 40,
            question: 'คุณสามารถเอาชนะการติดสิ่งเสพติด การพนัน ติดเกมส์ ติดเซ็กส์ หรือสิ่งอื่นที่ส่งผลเสียต่อชีวิตได้',
            answers: [{
                text: 'ไม่เห็นว่าสิ่งเหล่านี้แย่',
                value: 0
            }, {
                text: 'ยังมีปัญหานี้อยู่',
                value: 0.25
            }, {
                text: 'ดีขึ้นแต่ยังแก้ไม่หมด',
                value: 0.5
            }, {
                text: 'ยังมีเป้นครั้งคราวแต่ไม่ถึงกับเป็นปัญหา',
                value: 0.75
            }, {
                text: 'ชิวิตคลีนมาก',
                value: 1
            }],
            category: 'discipline',
            weight: 2
        }, {
            id: 41,
            question: 'คุณมักเป็นผู้เริ่มคิดและทำสิ่งต่างๆด้วยตนเอง  แม้ไม่มีใครมาชักชวนหรือต้องให้มีคนอื่นมาร่วมด้วยก่อน',
            answers: [{
                text: 'ไม่ใช่',
                value: 0
            }, {
                text: 'มีน้อย',
                value: 0.25
            }, {
                text: 'บางครั้ง',
                value: 0.5
            }, {
                text: 'เป็นบ่อย',
                value: 0.75
            }, {
                text: 'เป็นเสมอ',
                value: 1
            }],
            category: 'influence',
            weight: 4
        }, {
            id: 42,
            question: 'คุณพบว่าผู้อื่นยินดีทำตามเรา ทั้งที่เราอ่อนอาวุโสกว่า การศึกษาฐานะและตำแหน่งก็ไม่ได้เหนือกว่า',
            answers: [{
                text: 'ไม่เป็นอย่างนั้น',
                value: 0
            }, {
                text: 'มีน้อย',
                value: 0.25
            }, {
                text: 'มีบ้าง',
                value: 0.5
            }, {
                text: 'เป็นบ่อย',
                value: 0.75
            }, {
                text: 'เป็นอย่างนี้เสมอ',
                value: 1
            }],
            category: 'influence',
            weight: 1
        }, {
            id: 43,
            question: 'คุณพบว่าเมื่อคุณขอให้ผู้อื่นทำสิ่งที่ยากลำบากมาก คนก็ยินดีทำตามที่คุณต้องการ',
            answers: [{
                text: 'ไม่เป็น',
                value: 0
            }, {
                text: 'มีน้อย',
                value: 0.25
            }, {
                text: 'มีบ้าง',
                value: 0.5
            }, {
                text: 'เป็นบ่อย',
                value: 0.75
            }, {
                text: 'เป็นอย่างนี้ประจำ',
                value: 1
            }],
            category: 'influence',
            weight: 2
        }, {
            id: 44,
            question: 'คุณมีอิทธิพลทางจิตใจต่อผู้อื่น คำพูดและความเห็นของคุณมักมีน้ำหนักและน่าเชื่อถือต่อคนอื่น และคนอื่นมักทำตาม',
            answers: [{
                text: 'ไม่เป้นเช่นนั้น',
                value: 0
            }, {
                text: 'น้อยครั้ง',
                value: 0.25
            }, {
                text: 'บางครั้ง',
                value: 0.5
            }, {
                text: 'เกิดบ่อย',
                value: 0.75
            }, {
                text: 'เป็นเรื่องปกติ',
                value: 1
            }, ],
            category: 'influence',
            weight: 1
        }, {
            id: 45,
            question: 'คุณเก่งในการสื่อสาร การจูงใจ และการสอน ทั้งพูดและเขียน คนอื่นเข้าใจง่าย เห็นคล้อยตาม และปฏิบัติตามที่คุณพูด',
            answers: [{
                text: 'ไม่ใช่เลย',
                value: 0
            }, {
                text: 'มีน้อย',
                value: 0.25
            }, {
                text: 'พอใช้ได้',
                value: 0.5
            }, {
                text: 'ทำได้ดี',
                value: 0.75
            }, {
                text: 'เก่งเอามากๆ',
                value: 1
            }],
            category: 'influence',
            weight: 2
        }, {
            id: 46,
            question: 'คุณสามารถถ่ายทอดความคิดแก่ผู้อื่นได้อย่างเป็นระบบ เข้าใจง่าย และน่าสนใจ ทั้งด้วยการพูดและเขียน',
            answers: [{
                text: 'ไม่เลย',
                value: 0
            }, {
                text: 'พอทำได้แต่ไม่ค่อยดี',
                value: 0.25
            }, {
                text: 'ใช้ได้พอสมควร',
                value: 0.5
            }, {
                text: 'ทำได้ดี',
                value: 0.75
            }, {
                text: 'เก่งเลยทีเดียว',
                value: 1
            }],
            category: 'influence',
            weight: 1
        }, {
            id: 47,
            question: 'คุณมีคนที่พร้อมร่วมเป็นร่วมตายกับคุณ  และเชื่อฟังคุณแม้แต่จะต้องเสี่ยงต่อการเสียชีวิตก็ยอม',
            answers: [{
                text: 'ไม่มี',
                value: 0
            }, {
                text: 'มีคนสองคน',
                value: 0.25
            }, {
                text: 'มีสามสี่คน',
                value: 0.5
            }, {
                text: 'มีมากกว่าห้าคน',
                value: 0.75
            }, {
                text: 'มีมากกว่าสิบคน',
                value: 1
            }],
            category: 'influence',
            weight: 6
        }, {
            id: 48,
            question: 'ปกติไม่ว่าคุณจะไปที่ไหนหรือทำอะไรก็มักมีผู้คนอยากขอติดตามไปทำด้วย และอยากทำร่วมด้วยแค่ไหน',
            answers: [{
                text: 'ไม่ค่อยมี มักไปคนเดียว',
                value: 0
            }, {
                text: 'แค่กับคู่ซี้',
                value: 0.25
            }, {
                text: 'แค่กับกลุ่มประจำ',
                value: 0.5
            }, {
                text: 'มีคนตามเป็นกลุ่มใหญ่ที่รู้จัก',
                value: 0.75
            }, {
                text: 'มีคนตามมากมาย มีหลายคนที่ไม่รู้จัก',
                value: 1
            }],
            category: 'influence',
            weight: 1
        }, {
            id: 49,
            question: 'คุณชอบเข้าสังคมมากเพียงใด',
            answers: [{
                text: 'รักสันโดษมาก',
                value: 0
            }, {
                text: 'มักอยู่กับคู่ซี้',
                value: 0.25
            }, {
                text: 'มีกลุ่มเพื่อน 4-5 คน',
                value: 0.5
            }, {
                text: 'เพื่อนเยอะพรรคพวกเยอะ',
                value: 0.75
            }, {
                text: 'เป็นคนของสังคม',
                value: 1
            }],
            category: 'influence',
            weight: 1
        }, {
            id: 50,
            question: 'ตั้งแต่เรื่องในบ้าน เรียนหนังสือ ทำกิจกรร จนถึงทำงาน คุณมักถูกเลือกเป็นหัวหน้าบ่อยเพียงใด',
            answers: [{
                text: 'ไม่เคย',
                value: 0
            }, {
                text: 'น้อย',
                value: 0.25
            }, {
                text: 'มีบ้าง',
                value: 0.5
            }, {
                text: 'มีเรื่อยๆ',
                value: 0.75
            }, {
                text: 'ตลอด',
                value: 1
            }],
            category: 'influence',
            weight: 1
        }, {
            id: 51,
            question: 'ขณะนี้คุณวางเป้าหมายชีวิตไว้ใหญ่ขนาดไหน',
            answers: [{
                text: 'ไม่ได้วางเป้าหมายอะไรไว้',
                value: 0
            }, {
                text: 'ก็แค่ก้าวไปตามที่สอบติดหรือเรียนมา',
                value: 0.25
            }, {
                text: 'มีวางไว้บ้างคร่าวๆ แต่ไม่ซีเรียส',
                value: 0.5
            }, {
                text: 'มีเป้าหมายชัด และมุ่งมั่น',
                value: 0.75
            }, {
                text: 'เป้าหมายชัดและค่อนข้างใหญ่เกินตัว จนบางคนว่าเพ้อฝัน',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 52,
            question: 'คุณมีการวางแผนชีวิตตัวเอง ทั้งแผนระยะสั้น ระยะกลาง และระยะยาว และพยายามทำให้สำเร็จตามแผน',
            answers: [{
                text: 'ฉันไม่มีแผน ปล่อยให้เป็นตามธรรมชาติ',
                value: 0
            }, {
                text: 'ฉันมีแผนสั้นๆ อยู่เรื่อยๆ',
                value: 0.25
            }, {
                text: 'ฉันมีแผนสั้นและกลาง และเริ่มทำบางอย่าง',
                value: 0.5
            }, {
                text: 'ฉันมีแผนสั้นกลางและยาวแต่ยังไม่มีวิธีปฏิบัติที่ชัดเจน',
                value: 0.75
            }, {
                text: 'ฉันมีแผนทั้งสั้น กลาง และยาวและวิธีปฏิบัติให้แผนสำเร็จ',
                value: 1
            }, ],
            category: 'purpose',
            weight: 2
        }, {
            id: 53,
            question: 'คุณมักทำอย่างไรตอนเจอกับความล้มเหลว',
            answers: [{
                text: 'คงไม่ใช่ทางของเรา',
                value: 0
            }, {
                text: 'ลดความคาดหวังลง',
                value: 0.25
            }, {
                text: 'ลองดูอีกครั้งแล้วค่อยตัดสินใจ',
                value: 0.5
            }, {
                text: 'สู้ต่อไป',
                value: 0.75
            }, {
                text: 'ล้มกี่ครั้งยังสู้',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 54,
            question: 'คุณลองทำสิ่ง "แปลกใหม่ใหญ่ยาก" มากแค่ไหน',
            answers: [{
                text: 'ไม่เคยคิด เสียเวลา',
                value: 0
            }, {
                text: 'ชอบทำสิ่งที่คุ้นเคย',
                value: 0.25
            }, {
                text: 'ก็มีบ้างแต่น้อย',
                value: 0.5
            }, {
                text: 'ชอบ และทำบ่อย',
                value: 0.75
            }, {
                text: 'ชอบมากๆ ยิ่งยากยิ่งชอบ',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 55,
            question: 'คุณเคย "ฝันและลงมือทำตามฝัน" แค่ไหน',
            answers: [{
                text: 'ไม่ฝัน อยู่กับความเป็นจริง',
                value: 0
            }, {
                text: 'ฝันบ้างแต่ทำจริงยาก',
                value: 0.25
            }, {
                text: 'มีฝันและเคยลองทำ',
                value: 0.5
            }, {
                text: 'มีฝันและกำลังทำตามฝันอยู่',
                value: 0.75
            }, {
                text: 'บ้าฝันและบ้าทำมาตลอด',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 56,
            question: 'คุณมีเพื่อนสนิทสักกี่คนที่ถือว่า ยอมร่วมทำงานหรือเผชิญความลำบากเพื่อให้บรรลุเป้าหมายของคุณ',
            answers: [{
                text: 'ไม่มี',
                value: 0
            }, {
                text: 'อาจจะคนสองคน',
                value: 0.25
            }, {
                text: 'สามสี่คน',
                value: 0.5
            }, {
                text: 'ห้าคนขึ้นไป',
                value: 0.75
            }, {
                text: 'สิบคนขึ้นไป',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 57,
            question: 'ที่ผ่านมาคุณเลือกแนวทางชิวิตแบบใดมากกว่า ระหว่าง "ปลอดภัยไว้ก่อน" กับ "มุ่งไปให้ถึงฝัน"',
            answers: [{
                text: 'ไม่ยึดทั้งสองอย่าง',
                value: 0
            }, {
                text: 'ปลอดภัยไว้ก่อน',
                value: 0
            }, {
                text: 'ไปตามสถานการณ์',
                value: 0.25
            }, {
                text: 'ตามฝันแต่ไม่เสี่ยงมาก',
                value: 0.5
            }, {
                text: 'มุ่งไปให้ถึงฝัน มุ่งไปให้ได้ไกลกว่าที่เคยฝัน',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 58,
            question: 'ที่ผ่านมาคุณรู้สึกว่าคุณทุ่มเทเพียงใดเพื่อให้ฝันสำเร็จ',
            answers: [{
                text: 'สบาย สบาย',
                value: 0
            }, {
                text: 'ได้แค่ไหนก็แค่นั้น',
                value: 0.25
            }, {
                text: 'ทำดีที่สุดในแต่ละวัน',
                value: 0.5
            }, {
                text: 'ทุ่มเทมากๆ',
                value: 0.75
            }, {
                text: 'ตายเป็นตาย เจ๊งเป็นเจ๊ง',
                value: 1
            }],
            category: 'purpose',
            weight: 2
        }, {
            id: 59,
            question: 'เรื่องยากๆที่คุณทำในชีวิต มักสำเร็จสักกี่เปอร์เซ็นต์',
            answers: [{
                text: 'ต่ำกว่า 25%',
                value: 0
            }, {
                text: 'ต่ำกว่า 50%',
                value: 0.25
            }, {
                text: '50% ถึง 70%',
                value: 0.5
            }, {
                text: '70% ถึง 90%',
                value: 0.75
            }, {
                text: '90% ขึ้นไป',
                value: 1
            }],
            category: 'purpose',
            weight: 1
        }, {
            id: 60,
            question: 'เป้าหมายชีวิตสำหรับคุณแล้ว...',
            answers: [{
                text: 'ไม่มีใครกำหนดชะตาชีวิตได้',
                value: 0
            }, {
                text: 'ทำได้ก็ดีไม่ได้ไม่เป็นไร',
                value: 0.25
            }, {
                text: 'จะทำเท่าที่ทำได้',
                value: 0.75
            }, {
                text: 'จะพยายามทำให้ดีที่สุด',
                value: 0.5
            }, {
                text: 'ชีวิตอยู่เพื่อเป้าหมายนี้ ต้องทำสำเร็จให้ได้',
                value: 1
            }],
            category: 'purpose',
            weight: 4
        }, {
            id: 61,
            question: 'คุณมักใช้ความคิดเพื่ออะไรเป็นส่วนใหญ่',
            answers: [{
                text: 'เพื่อการจดจำ',
                value: 0.1
            }, {
                text: 'เพื่อทำความเข้าใจ',
                value: 0.25
            }, {
                text: 'เพื่อวิเคราะห์',
                value: 0.35
            }, {
                text: 'เพื่อนำมาประยุกต์ใช้',
                value: 0.5
            }, {
                text: 'เพื่อสร้างความรู้ใหม่ต่อยอดความรู้เดิม',
                value: 1
            }],
            category: 'wisdom',
            weight: 6
        }, {
            id: 62,
            question: 'คุณจะอุทิศตัวเพื่อเป็นคนดีมากเพียงใด',
            answers: [{
                text: 'ปากท้องสำคัญกว่าความดี',
                value: 0
            }, {
                text: 'แค่ไม่มีใครด่าว่าเป็นคนเลวก็พอแล้ว',
                value: 0.15
            }, {
                text: 'ฉันเชื่อว่าทำดีจะได้ไปสวรรค์-ไม่ต้องตกนรก',
                value: 0.35
            }, {
                text: 'ฉันเชื่อว่าคุณธรรมค้ำจุนโลก',
                value: 0.5
            }, {
                text: 'ฉันยอมตายเพื่อบรรลุความดีสูงสุด แม้ไม่ได้อะไรตอบแทน',
                value: 1
            }],
            category: 'moral',
            weight: 6
        }, {
            id: 63,
            question: 'ภาษิตต่อไปนี้ อันไหนใกล้เคียงอุดมการณ์ชีวิตของคุณมากที่สุด',
            answers: [{
                text: 'รู้รักษาตัวรอดเป็นยอดดี',
                value: 0
            }, {
                text: 'ใครดีก็ดีตอบ ใครร้ายก็ร้ายตอบ',
                value: 0.15
            }, {
                text: 'เสียชีพอย่าเสียสัตย์',
                value: 0.35
            }, {
                text: 'รักผู้อื่นเหมือนรักตนเอง',
                value: 0.65
            }, {
                text: 'ส่วนรวมสำคัญกว่าส่วนตัว',
                value: 1
            }],
            category: 'beatitude',
            weight: 6
        }, {
            id: 64,
            question: 'คุณควบคุมอารมณ์ตัวเองแค่ไหน',
            answers: [{
                text: 'มักปล่อยให้อารมณ์มันสงบไปเอง',
                value: 0
            }, {
                text: 'มักคุมได้ตอนอารมณ์ขึ้นถึงจุดสูงสุด',
                value: 0.15
            }, {
                text: 'มักคุมได้ตอนอารมณ์ใกล้ถึงจุดสูงสุด',
                value: 0.35
            }, {
                text: 'มักคุมได้ตอนอารมณ์เริ่มเกิด',
                value: 0.5
            }, {
                text: 'มักคุมอารมณ์ได้ตั้งแต่ก่อนจะเกิดอารมณ์นั้น',
                value: 1
            }],
            category: 'discipline',
            weight: 6
        }, {
            id: 65,
            question: 'คุณต้องการอะไรมากที่สุดในชีวิต',
            answers: [{
                text: 'มีกินมีใช้ไม่ลำบาก',
                value: 0.15
            }, {
                text: 'มีครอบครัวและเพื่อนฝูง',
                value: 0.25
            }, {
                text: 'ทำดีมีชื่อเสียงเป็นที่รู้จัก',
                value: 0.35
            }, {
                text: 'ช่วยเหลือคนอื่น',
                value: 0.5
            }, {
                text: 'เปลี่ยนแปลงโลกนี้ให้ดีขึ้น',
                value: 1
            }],
            category: 'purpose',
            weight: 6
        }];
        return questions;
    });
