const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template'); // 모듈로 뺌

const templateHTML = (title, list, body, control) => {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
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


const app = http.createServer(function(request,response){
  const _url = request.url; // 3000 뒷 부분. / , /?id=css3 등
  const queryData = url.parse(_url, true).query; // [Object: null prototype] { id: 'html' }
  const pathname = url.parse(_url, true).pathname; // /update, /create
    if(pathname === '/'){ // 3000 뒷 부분. /은 홈
      if(queryData.id === undefined){ // id 입력되지 않았을 때, 즉 홈
        fs.readdir('./data', function(error, filelist){
          const title = 'Welcome home';
          const description = 'Hello, Node.js';
          
          // let list = templateList(filelist);
          let list = template.list(filelist);

          const html = template.html(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href = '/create'>create</a>`
            );

          response.writeHead(200);
          response.end(html);
        })
      } else { // 아이디 입력 되었을 때, 즉 페이지 이동 시
        fs.readdir('./data', function(error, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            const title = queryData.id;
            let list = template.list(filelist);
            const html = template.html(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href = '/create'>create</a>
              <a href = '/update?id=${title}'>update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>`
              );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if (pathname === '/create') { // http://localhost:3000/create
      fs.readdir('./data', function(error, filelist){
        const title = 'WEB - create';
        
        let list = templateList(filelist);

        const template = templateHTML(title, list, `
        <form action = "/create_process" method="post">
        <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
          <p><input type = "text" placeholder = "title" name = "title"></p>
          <p>
              <textarea placeholder = "description" name = 'description'></textarea>
          </p>
      
          <p>
              <input type="submit">
          </p>
        </form>
        `, ''); // form 입력 양식

        response.writeHead(200);
        response.end(template);
      })
    } else if (pathname === '/create_process') { // 처리한 후에 쓴 글 페이지로 리다이렉션 하자. 302
        let body = '';

        request.on('data', (data) => { // 전송된 데이터 가져오기
          body += data; // 정보 조각조각 들어오다가
        });

        request.on('end', () => { // 다 들어오면
          const post = qs.parse(body); // 객체화
          const title = post.title; // 제목
          const description = post.description; // 설명
          console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

          fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
            response.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션. 쓴 글 페이지로 바로 이동.
            response.end('success');
          });
        });

        
    } else if (pathname === '/update') {
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
        const title = queryData.id;
        let list = templateList(filelist);
        const template = templateHTML(title, list, // hidden으로 사용자에게는 안보이게 원래 제목 저장. f12-network-payload 확인. 
          `
          <form action = "/update_process" method="post">
          <input type = "hidden" name = "id" value = "${title}">
          <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
            <p><input type = "text" placeholder = "title" name = "title" value = ${title}></p>
            <p>
                <textarea placeholder = "description" name = 'description'>${description}</textarea>
            </p>
        
            <p>
                <input type="submit">
            </p>
          </form>
          
          `,
          `<a href = '/create'>create</a> <a href = '/update?id=${title}'>update</a>`
          );
        response.writeHead(200);
        response.end(template);
      });
    });
    } else if (pathname === '/update_process') {
      let body = '';

        request.on('data', (data) => { // 전송된 데이터 가져오기
          body += data; // 정보 조각조각 들어오다가
        });

        request.on('end', () => { // 다 들어오면
          const post = qs.parse(body); // 객체화
          const id = post.id;
          const title = post.title; // 제목
          const description = post.description; // 설명

          fs.rename(`data/${id}`, `data/${title}`, (error) => { // 파일명 변경. oldpath, newPath, callback
            // 내용 바꾸기
            fs.writeFile(`data/${title}`, description, 'utf8', () => {
              response.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션. 쓴 글 페이지로 바로 이동.
              response.end('success');
            })
          });

          console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

        });
    } else if (pathname === '/delete_process') {
        let body = '';

        request.on('data', (data) => { // 전송된 데이터 가져오기
          body += data; // 정보 조각조각 들어오다가
        });

        request.on('end', () => { // 다 들어오면
          const post = qs.parse(body); // 객체화
          const id = post.id;
          fs.unlink(`data/${id}`, (error) => {
            response.writeHead(302, {Location: `/`}); // 삭제되면 바로 홈으로
            response.end();
          })

          console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

        });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000, () => {
  console.log('port 3000!');
});