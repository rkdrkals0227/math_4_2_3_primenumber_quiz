/* 학습 공간과 주민 설정: x/y는 주민 위치, bx/by는 건물 위치입니다. */
(function(F){
F.questions=F.questionData;
F.zones=[
{name:'씨앗밭',npc:'콩이',tag:'기본 덧셈',color:'#689249',x:11,y:12,building:'seedhouse',bx:9,by:9,hello:'반가워, 새 농장 주인! 숫자마다 제자리를 찾아 주면 작은 씨앗이 깨어나. 함께 심어 볼까?',reward:'씨앗을 심었어! 다른 작물도 한 단계 자랐어.'},
{name:'물방울 온실',npc:'방울',tag:'받아올림 덧셈',color:'#438f9d',x:19,y:9,building:'greenhouse',bx:18,by:6,hello:'또르르, 반가워! 물방울 에너지 충전 준비 완료. 받아올림을 찾아 식물에게 물을 줄까?',reward:'물방울 충전! 온실에 꽃이 피어나고 있어.'},
{name:'도구 작업장',npc:'모루',tag:'소수의 뺄셈',color:'#b17a4e',x:28,y:12,building:'workshop',bx:28,by:9,hello:'똑딱똑딱! 큰 장갑으로도 작은 숫자를 소중하게 다루지. 뺄셈으로 마을을 고쳐 볼까?',reward:'뚝딱! 울타리와 다리가 튼튼해졌어.'},
{name:'알록달록 장터',npc:'포포',tag:'생활 속 소수',color:'#b96e83',x:20,y:29,building:'market',bx:22,by:27,hello:'어서 와요, 반짝 손님! 무게와 길이를 정확히 계산하면 멋진 주문이 완성돼요.',reward:'주문 완성! 장터가 더 알록달록해졌어.'},
{name:'별빛 축제 광장',npc:'별빛지기',tag:'마지막 종합 복습',color:'#8c78ad',x:9,y:30,building:'stage',bx:8,by:27,hello:'네가 키운 마을에 별빛이 모였어. 다섯 개의 별을 밝혀 우리만의 축제를 열자!',reward:'축제에 별빛 하나가 더 켜졌어!'}
];
})(Farm);
