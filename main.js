
//------------------------------------------------------------------------------
//   全てのピースを画面上で再配置する
//------------------------------------------------------------------------------
function arrangeAllPieces(data){
     let offset = $(".puzzle-board").offset();
     for( let n = 0 ; n < 16 ; n++ )
     {
          if( data[n] === BLANK )
          {
               continue;
          }
          let $piece = $(`#${data[n]}`);
          $piece.offset({
               left: offset.left + (n % 4)*125,
               top:  offset.top  + Math.floor(n / 4)*125
          });
     }
}

//------------------------------------------------------------------------------
//   ピースを動かして盤面の表示を更新する
//------------------------------------------------------------------------------
function updateView(number, dir, callback){
     let $piece = $(`#${number}`);
     let ofs = $piece.parent().offset();
     let pos = $piece.offset();
     switch( dir )
     {
          case 'left':
          case 2:
               pos.left -= 125;
               break;
          case 'up':
          case 0:
               pos.top -= 125;
               break;
          case 'right':
          case 3:
               pos.left += 125;
               break;
          case 'down':
          case 1:
               pos.top += 125;
               break;
     }
     count();
     $piece.animate({
          left: `${pos.left - ofs.left}px`,
          top:  `${pos.top - ofs.top}px`
     }, 120, 'swing', callback);
}

//------------------------------------------------------------------------------
function autoSolve(puzzle, solution){
     if( solution.length === 0 )
     {
          return;
     }
     let dir = solution.shift();
     let number = puzzle.getMovablePiece(dir);
     puzzle.movePiece(dir);
     updateView(number, dir, function(){
          autoSolve(puzzle, solution);
     });
}
//------------------------------------------------------------------------------
//   動かした回数をカウント
//------------------------------------------------------------------------------
function count(){
     var thisCount = $("#count").html();
         thisCount = Number(thisCount);
         thisCount = thisCount + 1;
     $("#count").html(thisCount);
   }

//------------------------------------------------------------------------------
//   ドキュメントロード時の処理
//------------------------------------------------------------------------------
$(function(){
     let puzzle = new Puzzle();
     puzzle.initialize();
     for( let n = 1 ; n <= 15 ; n++ )
     {
          let $cell = $(`#${n}`);
          $cell.text(n).on('click', function(){
               let number = parseInt($(this).attr("id"), 10);
               let dir = puzzle.canMove(puzzle.findPiece(number));
               if( dir )
               {
                    puzzle.movePiece(dir);
                    updateView(number, dir, function(){
                         if( puzzle.isCompleted() )
                         {
                              var  click_t= $("#count").html();
                              click_t = Number(click_t);
                              alert('完成です．おめでとうございます。！\n動かした回数：'+click_t+'回');
                         }
                    });
               }
          });
     }
     
     // 「リセット」ボタンのクリックイベント処理
     $("#reset").on('click', function(){
          puzzle.shuffle();
          arrangeAllPieces(puzzle.data);
           $("#count").html(0);

     });

     // 「ギブアップ」ボタンのクリックイベント処理
     $("#giveup").on('click', function(){
          let solution = puzzle.solve();
          autoSolve(puzzle, solution);
     });

     arrangeAllPieces(puzzle.data);

     // リセット
     $("#reset").trigger('click');
});
