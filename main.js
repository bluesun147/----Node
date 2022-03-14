var http = require('http');
var fs = require('fs');
var url = require('url');
const qs = require('querystring');
 
const templateHTML = (title, list, body) => {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      <a href = '/create'>create</a>
      ${body}
    </body>
    </html>
    `;
}

const templateList = (filelist) => {
    let list = '<ul>';
    let i = 0;
    while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}!</a></li>`;
    i = i + 1;
    }
    list = list+'</ul>';
    return list;
}


var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){ // 3000 뒷 부분. /은 홈
      if(queryData.id === undefined){ // id 입력되지 않았을 떄, 즉 홈
 
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome home';
          var description = 'Hello, Node.js';
          
          let list = templateList(filelist);

          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);

          response.writeHead(200);
          response.end(template);
        })
      } else { // 아이디 입력 되었을 때, 즉 페이지 이동 시
        fs.readdir('./data', function(error, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            let list = templateList(filelist);
            var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else if (pathname === '/create') { // http://localhost:3000/create
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        
        let list = templateList(filelist);

        var template = templateHTML(title, list, `
        <form action = "http://localhost:3000/create_process" method="post">
        <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
          <p><input type = "text" placeholder = "title" name = "title"></p>
          <p>
              <textarea placeholder = "description" name = 'description'></textarea>
          </p>
      
          <p>
              <input type="submit">
          </p>
        </form>
        `); // form 입력 양식

        response.writeHead(200);
        response.end(template);
      })
    } else if (pathname === '/create_process') {
        let body = '';

        request.on('data', (data) => { // 전송된 데이터 가져오기
          body += data; // 정보 조각조각 들어오다가
        });

        request.on('end', () => { // 다 들어오면
          const post = qs.parse(body); // 객체화
          const title = post.title; // 제목
          const description = post.description; // 설명
          console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }
        })

        response.writeHead(200);
        response.end('success');
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000, () => {
  console.log('port 3000!');
});