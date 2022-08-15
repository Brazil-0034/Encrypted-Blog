// if browser is using HTTP, add a link to the https version
if (window.location.protocol == "http:") {
    var httpsLink = window.location.href.replace("http:", "https:");
    document.body.innerHTML = '<a href="' + httpsLink + '">Click here to access this page using HTTPS</a>';
    document.querySelector("a").className = "redir-link";
}

function autoscale() {
    var textarea = document.getElementById("content");
    textarea.style.height = "";
    textarea.style.height = textarea.scrollHeight + "px";
}

function newPost() {
    document.querySelector(".post-area").style.display = "block";
    document.querySelector(".post-area").style.animation = "flyIn 0.75s";
    document.querySelector(".post-area").style.animationFillMode = "forwards";

    document.querySelector("#new-word-button").style.animation = "disappear 0.5s";
    document.querySelector("#new-word-button").style.animationFillMode = "forwards";

    // delay 0.5s, delete new-word-button
    setTimeout(function () {
        document.querySelector("#new-word-button").remove();
    }, 500);
}

function sendPost() {
    var postURL = window.location.href + "post/";
    // create url args
    const args = new URLSearchParams();

    args.append("title", document.getElementById("title").value);

    let content = document.getElementById("content").value;
    // replace newlines with <br>>
    content = content.replace(/\n/g, "<br>");

    args.append("content", content);

    window.location.href = postURL + "?" + args.toString();
}

// make a simple http request
function httpRequest(url, method, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
        }
    };
    xhttp.open(method, url, true);
    xhttp.send();
}

// get the posts from the server
function getPosts() {
    const postbox = document.querySelector(".postbox");
    httpRequest("/getposts", "GET", function (xhttp) {
        var posts = xhttp.responseText;
        // split by line break
        posts = posts.split("\n");
        posts.pop();
        for (var i = 0; i < posts.length; i++) {
            // create the post
            // parse as json
            let postData = JSON.parse(posts[i]);
            let post = document.createElement("div");
            post.className = "post";
            post.innerHTML = "<h1>" + postData.title.substring(8) + "</h1><br><p>" + postData.content + "</p><br>";
            postbox.append(post);

            // create a "decrypt" button on each post
            let decryptButton = document.createElement("a");
            decryptButton.innerHTML = "Decrypt";
            decryptButton.onclick = function () {
                // create an HTTP request to /decrypt for both the title and the content
                // then, replace each with their decrypted variant

                let title = postData.title;
                let content = postData.content;

                // url params
                const args = new URLSearchParams();
                args.append("passkey", prompt("Enter the passkey"));
                args.append("content", title);

                // make request
                httpRequest(window.location.href + "decrypt?" + args.toString(), "GET", function (xhttp) {
                    let decryptedContent = xhttp.responseText;
                    post.innerHTML = "<h1>" + decryptedContent + "</h1><br><p>"
                });

                args.set("content", content);
                httpRequest(window.location.href + "decrypt?" + args.toString(), "GET", function (xhttp) {
                    let decryptedContent = xhttp.responseText;
                    post.innerHTML += decryptedContent + "</p><br>";
                });
            }
            post.parentElement.appendChild(decryptButton);
        }
        for (let i = 1; i < postbox.childNodes.length; i++) postbox.insertBefore(postbox.childNodes[i], postbox.firstChild);
    });
}

getPosts();

// if the user clicks the "decrypt-all-button" button, decrypt all posts
document.querySelector("#decrypt-all-button").onclick = function () {
    const univPasskey = prompt("Enter the passkey");
    // basically the getposts function, but everything gets decrypted
    // start my clearing the .postbox element
    const postbox = document.querySelector(".postbox");
    postbox.innerHTML = "";

    httpRequest("/getposts", "GET", function (xhttp) {
        var posts = xhttp.responseText;
        // split by line break
        posts = posts.split("\n");
        posts.pop();

        let i = 0;
        function decryptPost(i)
        {
            let postData = JSON.parse(posts[i]);
            let post = document.createElement("div");
            post.className = "post decrypted";

            // decrypt the title and content
            let title = postData.title;
            let content = postData.content;

            // url params
            const args = new URLSearchParams();
            args.append("passkey", univPasskey);
            args.append("content", title);
            
            // make request
            httpRequest(window.location.href + "decrypt?" + args.toString(), "GET", function (xhttp) {
                let decryptedContent = xhttp.responseText;
                post.innerHTML = "<h1>" + decryptedContent + "</h1><br><p>"

                args.set("content", content);
                httpRequest(window.location.href + "decrypt?" + args.toString(), "GET", function (xhttp) {
                    let decryptedContent = xhttp.responseText;
                    post.innerHTML += decryptedContent + "</p><br>";
                    console.log(decryptedContent);
                    postbox.append(post);
                    
                    i++;
                    if (i < posts.length)
                    {
                        decryptPost(i);
                    }
                    else
                    {
                        for (let x = 1; x < postbox.childNodes.length; x++) postbox.insertBefore(postbox.childNodes[x], postbox.firstChild);
                    }
                });
            });
        }

        decryptPost(i);
    });
}
