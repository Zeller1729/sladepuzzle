(()=>{
 
    const puzzleScreenInfo ={
        size : 500,         // キャンバスのサイズ
        frameSize : 20 ,    // ゲーム盤外枠の幅
        pieceNum : 4,       // 横方向のピースの数
        animeTime: 200,      // アニメーション時間
    };
 
    /**
     * キャンバスを作成して配置
     * @param divId キャンバスを作成するDIV要素のID
     * @returns {[canvas,canvas]} [背景,パズル]のキャンバス配列
     */
    const makeSlidePuzzle = function ( divId  ) {
 
            // div要素取得
        const parentDiv = document.getElementById( divId );
        if( parentDiv === null ) throw new Error("id:" + divId + "がない");
 
            // キャンバスの表示サイズ
        const viewSize = Math.min( parentDiv.clientWidth , parentDiv.clientHeight );
 
            // キャンバスのスタイル設定
        const style ={ width : viewSize + "px" , height : viewSize + "px" ,
            top : ((parentDiv.clientHeight - viewSize) / 2).toString() + "px" ,
            left : ((parentDiv.clientWidth - viewSize) / 2).toString() + "px" };
 
            // キャンバスを3枚作成
        return [1,2,3].map( zindex => {
            const cv = document.createElement("canvas" );
            const layer = new layerCtrl( cv ,zindex );
            layer.setSize(puzzleScreenInfo.size,puzzleScreenInfo.size );
 
            layer.setStyle( style );
 
            parentDiv.appendChild( cv );
            return layer;
        });
    };
 
    /**
     * 背景描画用オブジェクト
     * @param layer
     */
    const backGroundDrawFunc = function ( layer ) {
 
        this.getLayer = ()=> layer;
 
        this.frame = null; // 外周 [ 始点x , 始点y , 幅 , 高さ ]
        this.innerFrame = null; // 内周( パズルエリア )
 
        this.frameColor = "burlywood"; // 外周色
        this.frameLineColor = "dimgray"; // 外周の線色
        this.bottomPlateColor ="tan"; // 底板の色
    };
    backGroundDrawFunc.prototype={
        /**
         * 背景描画に必要な座標を計算
         */
        init(){
            const   {size,frameSize} = {...puzzleScreenInfo};
 
            // 外周,内周セット
            this.frame = [0 , 0 , size , size];
            this.innerFrame = [ frameSize , frameSize,size - frameSize*2,size - frameSize*2  ];
            return this;
        },
        /**
         * init()で計算した情報をもとに背景を描画
         */
        draw(  ){
            this.getLayer().clearRect( this.frame )
                .rect( this.frame , this.frameColor , null )
                .rect( this.innerFrame , this.bottomPlateColor , this.frameLineColor );
        }
    };
    /**
     * ピースの描画用オブジェクト
     * @param layer
     * @param animeLayer
     */
    const pieceDrawFunc = function ( layer , animeLayer ) {
 
            this.getLayer = ()=> layer;
            this.getAnimeLayer = ()=> animeLayer;
 
            this.puzzleSize; // 枠を除いたパズルのサイズ
            this.pieceSize;  // １ピースのサイズ
            this.pieceData; // ピースデータの配列
            this.allPiceNUm; // ピースの総数
            this.pieceData;  // 盤上を分割した座標データ
            this.pieceImage;  // ピースのImageデータ
 
            this.pieceFillColor = "white";
            this.pieceStrokeColor = "dimgray";
 
            this.textStyle = {
                fillStyle : "black",
                strokeStyle : "white",
                textAlign : "center",
                textBaseline : "middle",
                lineWidth : 4,
                font : "20px 'arial'",
            };
    };
 
    pieceDrawFunc.prototype = {
 
        /**
         * ピースの描画に必要な座標を計算
         */
        init(  ){
 
            const layer =  this.getLayer();
            layer.setIndex(0);
 
            const   {size,frameSize,pieceNum,moveStep} = {...puzzleScreenInfo};
            const   topLeftPos =  frameSize;
 
            this.clear( );
 
            this.puzzleSize = size - frameSize * 2;
            const pieceSize = Math.round(this.puzzleSize / pieceNum);
            this.pieceSize = pieceSize;
            this.allPiceNUm = pieceNum * pieceNum;
 
            const pieceSizehalf =  Math.round(pieceSize / 2 );
            const pieceRect = [ 0 , 0 , pieceSize , pieceSize];
 
            this.pieceData = [];this.pieceImage = [];
 
            for( let i = 0 ; i < pieceNum ; i ++ ){
                const topPos = topLeftPos + i * pieceSize;
 
                for( let j = 0 ; j < pieceNum ; j ++ ){
                    const leftPos = topLeftPos + j * pieceSize;
 
                    layer.clearRect( pieceRect)
                        .rect( pieceRect , this.pieceFillColor , this.pieceStrokeColor )
                        .text( this.textStyle , (i*4 + j + 1).toString() , pieceSizehalf ,  pieceSizehalf );
 
                        // 座標データを記憶
                    this.pieceData.push( {
                        topLeftPos : [ leftPos  , topPos ],
                        rect : [ leftPos  , topPos , pieceSize , pieceSize]
                    });
                        // 画像イメージ等を記憶
                    this.pieceImage.push( layer.getImageData( pieceRect) );
                }
            }
            layer.clearRect( [0 ,0 ,  size,size] );
 
            layer.resetIndex();
 
        },
        /**
         * ピースを描画
         * @param piecePos ゲーム盤での位置 0～
         * @param pieceNumber ピースに表示する番号
         * @param anime アニメレイヤーに表示するかどうか
         */
        draw( piecePos , pieceNumber ,  anime = false){
            if( pieceNumber === null ) return;
            if( piecePos > this.allPiceNUm - 1  || pieceNumber >= this.allPiceNUm - 1 )
                throw new Error( "piecePos Max Over" );
 
            const piecePosData = this.pieceData[ piecePos ];
            const pieceImageData = this.pieceImage[ pieceNumber ];
 
            const posX =  piecePosData.topLeftPos[0];
            const posY =  piecePosData.topLeftPos[1];
 
            ((anime) ? this.getAnimeLayer() : this.getLayer()).clearRect( piecePosData.rect )
                .putImageData( pieceImageData , posX , posY);
        },
        /**
         * キャンバスのクリア
         */
        clear() {
            this.getLayer().clearRect( [0 ,0,puzzleScreenInfo.size,puzzleScreenInfo.size]);
        },
        /**
         * クリック情報からピース位置を取得
         * @param e クリックイベントデータ
         */
        getClickPiece( e ){
            const pieceSize = this.pieceSize;
            const {frameSize,pieceNum} = {...puzzleScreenInfo};
 
            const rect = e.target.getBoundingClientRect();
                  // キャンバスサイズとブラウザ上でのサイズ比率
            const scale = this.getLayer().getScale();
 
                  // ブラウザ座標→キャンバス上でのクリック座標計算
            let [x,y] = [ (e.clientX - rect.left) * scale,(e.clientY - rect.top)*scale];
 
            if( x >= this.puzzleSize || y >= this.puzzleSize ) return null;
 
            x -= frameSize; y -= frameSize;// 外枠分差し引く
            return Math.floor(x / pieceSize) + Math.floor(y / pieceSize ) * pieceNum;
        },
        /**
         * ピースの移動
         * @param fromPiece 開始位置
         * @param toPiece 終了入り
         * @param dir 移動方向
         * @param pieceNumber 移動するピース
         */
        move( fromPiece , toPiece , dir , pieceNumber  ){
 
            const fromData = this.pieceData[ fromPiece ];
 
                // 移動方向の決定 -1 : 左・上 0 移動なし 1 : 右・下
            const dirY = { "up" : -1 , "down" : 1 };
            const dirX = { "left" : -1 , "right" : 1 };
            const moveX = dir in dirX ? dirX[dir] : 0;
            const moveY = dir in dirY ? dirY[dir] : 0;
 
            const layer = this.getLayer();
 
            // アニメーションレイヤに移動するピースを描画
            this.draw( fromPiece , pieceNumber ,  true);
                // ピースレイヤーから移動するピースをクリア
            layer.clearRect( fromData.rect);
                // Promiseを返す
            return new Promise( (resolve, reject) => {
 
                const animeTime = puzzleScreenInfo.animeTime;
 
                const animeLayer = this.getAnimeLayer();
                const animeStyle = animeLayer.getCanvas().style;
                animeStyle.top = animeStyle.left = 0;
 
                    // キャンバス表示比率を取得
                const scale = animeLayer.getScale();
 
                    // 画面表示上でのピースのサイズを計算
                const pieceSize = Math.floor(this.pieceSize / scale);
 
                let startTime=null; // アニメーション開始時間
 
                const animeFunc = time => {
 
                        // 初回呼び出しは、startTimeを設定するのみ
                    if( startTime === null ) {
                        startTime = time;
                        window.requestAnimationFrame(animeFunc);return;
                    }
 
                        // 経過時間取得
                    const nowTime = time - startTime;
 
                        // 終了予定時間よりも経過した？
                    if( nowTime >= animeTime ) {
                            // ピースレイヤーに移動後のピースを描画
                        this.draw( toPiece , pieceNumber );
                            // アニメーションレイヤをクリア
                        animeLayer.clear();
                            // アニメーションレイヤのtop/left位置をリセット
                        animeStyle.top = animeStyle.left = 0;
                            // Promiseを解決
                        resolve( true );return;
                    }
 
                        // アニメ終了予定時間と現在の経過時間の比率を計算
                    const step = nowTime / animeTime;
                        // 移動距離を求める
                    const cX = Math.floor(moveX * step * pieceSize);
                    const cY = Math.floor(moveY * step * pieceSize);
                        // アニメーションレイヤのtop/leftを変更してアニメーションさせる
                    animeStyle.left = cX + "px";
                    animeStyle.top = cY + "px";
 
                    window.requestAnimationFrame(animeFunc);
                };
                window.requestAnimationFrame(animeFunc);
 
            });
 
        }
 
    };
 
    /**
     * レイヤー（キャンバス）操作ヘルパーオブジェクト
     * @param canvas
     * @param zindex
     */
    const layerCtrl = function( canvas , zindex ) {
        const context = canvas.getContext( "2d" );
        this.getCanvas = () => canvas;
        this.getContext = () => context;
 
        let beforeIndex = zindex;
 
        this.setIndex = index => {
            beforeIndex = canvas.style.zIndex;
            canvas.style.zIndex = index;
        };
        this.resetIndex = () => canvas.style.zIndex = beforeIndex;
    };
    layerCtrl.prototype = {
        /**
         * キャンバスにスタイルをセット
         * @param styleObj 例：{ widt: "100px" , height : "100px" }
         */
        setStyle( styleObj ){
            const canvas = this.getCanvas();
            Object.keys( styleObj ).forEach( e => canvas.style[e] = styleObj[e]);
        },
        /**
         * キャンバスサイズをセット
         * @param w
         * @param h
         */
        setSize( w , h ){
            const canvas = this.getCanvas();
            canvas.setAttribute("width", w );
            canvas.setAttribute("height", h );
        },
        /**
         * 四角を描画する
         * @param rect [ 左座標 , 上座標 , 幅 , 高さ ]
         * @param fillColor 塗りつぶし職 null ... 塗りつぶしなし
         * @param strokeColor 線色 null ... 線なし
         */
        rect( rect , fillColor , strokeColor = null ){
            const context = this.getContext();
            context.save();
            if( fillColor !== null ) {
                context.fillStyle = fillColor;context.fillRect( ...rect );
            }
            if( strokeColor !== null ) {
                context.strokeColor = strokeColor;context.strokeRect( ...rect );
            }
            context.restore();
            return this;
        },
        /**
         * テキストの描画
         * @param style  テキスト属性のオブジェクト
         * @param textString 描画する文字列
         * @param x 描画位置
         * @param y 描画位置
         */
        text( style , textString ,x , y){
            const context = this.getContext();
            context.save();
            Object.keys( style ).forEach( e => context[e] = style[e]);
            context.strokeText( textString , x ,  y);
            context.fillText( textString , x , y );
            context.restore();
            return this;
        },
        /**
         * イメージデータの取得
         * @param rect
         * @returns {ImageData}
         */
        getImageData( rect ){
            return this.getContext().getImageData( ...rect );
        },
        /**
         * イメージの描画
         * @param image
         * @param x
         * @param y
         * @returns {layerCtrl}
         */
        putImageData( image , x , y ){
            this.getContext().putImageData( image , x ,y );
            return this;
        },
        /**
         * キャンバス全面クリア
         */
        clear(){
            const cvs = this.getCanvas();
            this.getContext().clearRect( 0 , 0 , cvs.width , cvs.height  );
        },
        /**
         * キャンバスクリア
         * @param rect [ 左座標 , 上座標 , 幅 , 高さ ]
         * @returns {layerCtrl}
         */
        clearRect( rect ) {
            this.getContext().clearRect( ...rect  );
            return this;
        },
        /**
         * キャンバスのサイズと表示サイズの比率
         * @returns {number}
         */
        getScale (){
            const canvas = this.getCanvas();
            return canvas.clientWidth / canvas.width;
        }
    };
 
    /**
     * パズルのメイン処理
     * @param id div要素のID
     */
    const siledePuzzle = function( id ){
 
        this.puzzleData; // パズルデータ配列（インデックス：位置　値：その位置のピース番号)
        this.allPiceNUm; // ピースの総数
 
        const [backGroundLyer,puzzleLayer,animeLayer] = makeSlidePuzzle( id );
        this.drawObj = {
            backGround : new backGroundDrawFunc( backGroundLyer ),
            piece : new pieceDrawFunc( puzzleLayer,animeLayer ),
        };
 
        this.init().reDraw();
 
        this.clickEnabled = true;
        this.Shuffled = false;
        this.gameEnabled = false;
 
        this.completeFunc = null;
 
        animeLayer.getCanvas().addEventListener( "click" , e =>{
            if( !this.clickEnabled || !this.gameEnabled || this.Shuffled ) return;
 
            // クリック座標取得
            const clickNumber = this.drawObj.piece.getClickPiece( e );
            if( clickNumber === null ) {this.clickEnabled = true;return;}
 
            this.click(clickNumber);
 
                // パズルの完成チェック
            if( this.puzzleData.every( (e , i) => ( ( i === this.allPiceNUm - 1 && e === null) || ( e === i )) ) ){
                if( typeof this.completeFunc === "function" )  this.completeFunc();
            }
        }, false);
 
    };
    siledePuzzle.prototype={
        /**
         * パズル初期化メソッド
         * @returns {siledePuzzle}
         */
        init(){
            this.puzzleData = [];
            this.allPiceNUm = puzzleScreenInfo.pieceNum * puzzleScreenInfo.pieceNum;
 
            for( let i = 0 ; i < this.allPiceNUm -1 ; i ++ )
                    this.puzzleData.push( i );
 
            this.puzzleData[ this.allPiceNUm -1 ] = null;
 
            this.drawObj.backGround.init();
            this.drawObj.piece.init( );
            return this;
        },
        /**
         * 再描画メソッド
         * @returns {siledePuzzle}
         */
        reDraw(){
 
            this.drawObj.backGround.draw( );
            this.puzzleData.forEach( (e,i)=>{
                this.drawObj.piece.draw( i , e );
            });
            return this;
        },
        /**
         * クリックされたピースを移動する
         * @param clickNumber
         * @returns {Promise<void>}
         */
        async click( clickNumber ){
 
            this.clickEnabled = false;
                // クリック周辺のピースを取得
            const aroundInfo = this.getAroundInfo( clickNumber  );
            if( aroundInfo === false || aroundInfo.current === null ) {
                this.clickEnabled = true;return;
            }
 
                // 周辺データから空きスペースを取得
            const emptyData = aroundInfo.data.filter( e=>e.number===null);
            if( emptyData.length <= 0 ) {this.clickEnabled = true;return;}
 
                // パズルデータの値を入れ替え
            [this.puzzleData[clickNumber],this.puzzleData[emptyData[0].pos]]
                = [this.puzzleData[emptyData[0].pos],this.puzzleData[clickNumber]];
 
                // 移動アニメーションをおこなう
            await this.drawObj.piece.move( clickNumber , emptyData[0].pos , emptyData[0].dir , aroundInfo.current );
            // 結果が出るまで停止（Promiseオブジェクトがリターンされる）
 
            // move()が完了したら、以降のコードが実行される
            this.clickEnabled=true;
 
        },
        /**
         * 指定した位置の左右上下の情報取得
         * @param pos
         * @returns {boolean|{current: (boolean|*), data: [{number: (boolean|*), pos, dir: string}, {number: (boolean|*), pos, dir: string}, {number: (boolean|*), pos, dir: string}, {number: (boolean|*), pos, dir: string}]}}
         */
        getAroundInfo( pos ){
            const pInfo = this.getPieceInfo( pos );
            if( pInfo === false ) return false;
 
            const {pieceNum} = {...puzzleScreenInfo};
 
            const   x = pos % pieceNum, y = Math.floor(pos / pieceNum );
 
            return {
                current : pInfo,  // クリック位置のピース番号 nullなら空き
                /**
                 * 上下左右のピース番号
                 *     dir 方向
                 *     pos その方向の位置番号
                 *     number その方向のピース番号 nullなら空き falseならピースがない
                 */
                data:[
                    {dir:"left", pos : pos - 1 , number : x <= 0 ? false : this.getPieceInfo( pos - 1 ) },
                    {dir:"right",pos : pos + 1 , number : x >= pieceNum - 1 ? false : this.getPieceInfo( pos + 1 ) },
                    {dir:"up" , pos : pos - pieceNum , number: y <= 0 ? false : this.getPieceInfo( pos - pieceNum ) },
                    {dir:"down" , pos : pos + pieceNum , number : y >= pieceNum - 1 ? false : this.getPieceInfo( pos + pieceNum )}
                    ]
            };
        },
        /**
         * 指定した位置にあるピース番号を取得
         * @param pos
         */
        getPieceInfo( pos ){
            if( pos < 0 || pos >= this.allPiceNUm ) return false;
            return this.puzzleData[pos];
        },
        /**
         * スライドパズルが完了したとき呼び出される関数をセット
         * @param t
         */
        set onComplete(t){
            if( typeof t !== "function" ) throw new Error("siledePuzzle:onClick parameter is not function");
            this.completeFunc = t;
        },
        /**
         * スライドパズルで画面クリックを無効にする
         * @param t
         */
        set enabled(t){
            this.gameEnabled = t === true;
        },
        /**
         * ピースをシャッフルする
         * @param count シャッフルする回数
         * @param callBack 一回の移動後にに呼び出されるコールバック関数
         */
        async shuffle( count , callBack ){
 
            if( this.shuffled ) return false;
 
            this.shuffled = true;
 
            let beforePiece=-1;
 
            for( let i = 0 ; i < count ; i ++ ){
                    // 空きスペースを検索
                const spc = this.puzzleData.indexOf(null);
                    // 空きスペースの左右上下を取得
                const aInfo = this.getAroundInfo( spc );
                    // 移動可能なピースを取得（前回移動したピースを除く）
                const data = aInfo.data.filter(
                    e => e.number !== false &&  e.number !== beforePiece
                );
                    // ランダムで移動するピースを決定
                const moveData = data[ Math.floor(Math.random() * data.length) ];
                beforePiece = moveData.number;
                    // 移動する
                await this.click( moveData.pos );
                    // awaitが付いているので、click()の結果が出るまで一時停止
                    // 呼び出し元には初回(i===0)のときPromiseオブジェクトがリターンされる
                if( typeof callBack === "function" ) callBack( i + 1 , count );
            }
            this.shuffled = false;
            return true;
        }
 
    };
 
    document.addEventListener( "DOMContentLoaded" , ()=>{
        const puzzle = new siledePuzzle( "slidepuzzle" );
        puzzle.onComplete = ()=>{
            message.innerText = "揃いました！！";
        };
 
        const message = document.getElementById( "message" );
 
        const shuffle1 = document.getElementById( "shuffle1" );
        const shuffle2 = document.getElementById( "shuffle2" );
 
        const shuffle = count => {
            return () =>
                puzzle.shuffle(count , ( i , max ) => message.innerText=`${i}/${max}`)
                    .then( e=> {
                        console.log( e );
                        if( e ) {
 
                            puzzle.enabled = true;
                            message.innerText= "シャッフル完了";
                        }
                    } );
        };
 
        shuffle1.addEventListener( "click" , shuffle(50) );
        shuffle2.addEventListener( "click" , shuffle(100) );
    });
})();