    /*chat.js*/
    $(function() {
        var socket = io();
        var myName = null;
        var nuser;
        //按下login按鈕
        $('.login-btn').click(function() {
            myName = $.trim($('#loginName').val());
            if (myName) {

                socket.emit('login', {
                    username: myName
                })

            } else {
                alert('Please enter a name:')
            }
        })

        /*登入成功*/
        socket.on('loginSuccess', function(data) {
            if (data.username === myName) {
                /*隱藏登入頁，顯示朋友頁*/
                checkIn(data)
                console.log("client", socket.id)


            } else {
                alert('Wrong username: Please try again!')
            }
        })

        //wwww
        // 第一次登陆接收其它成员信息
        socket.on('first', function(user) {
            if (user.length >= 1) {

                for (var i = user.length; i > 0; i--) {
                    //寫在下方聊天室(使用者，以及頭像)
                    //插入人像
                    incomeHtml(user[i - 1], 'images/donotss.jpg');



                    // incomeHtml(user[i], 'src/img/head2.jpg');
                }
            }
            nuser = user;
            console.log(nuser)
        });
        // 监听中途的成员加入
        socket.on('user joined', function(tname) {
            incomeHtml(tname, 'images/donotss.jpg');

            console.log(tname + '加入');

            //加入彈出桌面訊息
            //showNotice('src/img/head.jpg', tname, "上线了");
        });

        /*登入失敗*/
        socket.on('loginFail', function() {
            alert('Duplicate name already exists:0')
        })



        /*隱藏登入頁，顯示朋友頁*/
        function checkIn(data) {
            $('.login-wrap').hide('slow');
            $('.friend-wrap').show('slow');
        }


        /*加入聊天室提示*/
        socket.on('add', function(data) {
            var html = `<p>${data.username} 加入聊天室</p>`
            $('.chat-con').append(html);
            document.getElementById('chat-title').innerHTML = `在線人數: ${data.userCount}`;
            document.getElementById('friend-title').innerHTML = `在線人數: ${data.userCount}`;

        })


        //單人加入
        //換單人聊天室
        $('.sin-chBtn').click(function() {
            let chage = confirm('Are you sure you want to join simple chatroom')
            if (chage) {
                checkIn3()
            }
        })

        //多加入
        //換多人聊天室
        $('.mul-chBtn').click(function() {
            let chage = confirm('Are you sure you want to join multiplayer chatroom')
            if (chage) {
                checkIn2()
            }
        })

        /*隱藏登入頁，顯示聊天頁*/
        function checkIn2() {
            $('.friend-wrap').hide('slow');
            $('.chat-wrap').show('slow');
        }
        /*隱藏登入頁，顯示聊天頁*/
        function checkIn3() {
            $('.chat-wrap').hide('slow');
            $('.friend-wrap').show('slow');
        }

        //單人聊天室觸發離開按鈕
        $('.leaveBtn').click(function() {
            let leave = confirm('Are you sure you want to leave?')
            if (leave) {
                /*觸發 logout 事件*/
                socket.emit('logout', {
                    username: myName
                });
                window.location.href = "http://localhost:3000/index";
            }
        })

        //多人聊天室觸發離開按鈕
        $('.leaveBtn2').click(function() {
            let leave = confirm('Are you sure you want to leave?')
            if (leave) {
                /*觸發 logout 事件*/
                socket.emit('logout', {
                    username: myName
                });
                window.location.href = "http://localhost:3000/index";
            }
        })

        //離開成功
        socket.on('leaveSuccess', function() {
            // checkOut()
            // checkOut2()
        })

        function checkOut() {
            $(".login-wrap").show('slow');
            $(".friend-wrap").hide("slow");
        }

        function checkOut2() {
            $(".login-wrap").show('slow');
            $(".chat-wrap").hide("slow");
        }

        // function checkOut() {
        //     $(".login-wrap").show('slow');
        //     $(".chat-wrap").hide("slow");
        // }

        //退出提示
        socket.on('leave', function(data) {
            if (data.username != null) {
                let html = `<p>${data.username} 退出聊天室</p>`;
                $('.chat-con').append(html);
                document.getElementById('chat-title').innerHTML = `在線人數: ${data.userCount}`;
                document.getElementById('friend-title').innerHTML = `在線人數: ${data.userCount}`;
            }
        })


        // 監聽中途的成员离开
        socket.on('user left', function(data2) {
            //console.log(data + '离开');
            $('#' + hex_md5(data2)).remove();
            $('#li' + hex_md5(data2)).remove();
        });
        socket.on('user left2', function(user) {
            //console.log(data + '离开');

            for (var i = 0; i < user.length; i++) {
                //寫在下方聊天室(使用者，以及頭像)
                //插入人像

                $('#' + hex_md5(user[i])).remove();
                $('#li' + hex_md5(user[i])).remove();
            }

        });
        //單人聊天
        // 接收私聊信息

        //sendMessage
        //按下click鍵
        $(document).on('click', '.chat-active .send', function() {
            var recipient = $('.chat-active').attr('data-n');
            var val = $('.chat-active .ip3').val();
            if (val == '') return;
            sendMessage2(myName, val);
            //call
            var req = {
                'addresser': myName,
                'recipient': recipient,
                'type': 'plain',
                'body': val
            }
            socket.emit('send private message', req);
            $('.chat-active .ip3').val('');
            scrollToBottom(hex_md5(recipient));
        });
        //按下enter鍵，與上方事件相同
        document.onkeydown = function(e) {
            if (e && e.keyCode == 13) {
                var recipient = $('.chat-active').attr('data-n');
                var val = $('.chat-active .ip3').val();
                if (val == '') return;
                sendMessage2(myName, val);
                //call
                var req = {
                    'addresser': myName,
                    'recipient': recipient,
                    'type': 'plain',
                    'body': val
                }
                socket.emit('send private message', req);
                $('.chat-active .ip3').val('');
                scrollToBottom(hex_md5(recipient));
            }
        }

        //單人聊天回復
        socket.on('receive private message', function(data) {

            // data.body = showEmojis(data.body)
            // console.log('轉換')

            if (data.addresser == data.recipient) return;
            var head = 'images/donotss.jpg';

            // $('#' + hex_md5(data.addresser) + ' .chat-msg').append('<li><img src="' + head + '"><span class="speak">' + data.body + '</span></li>');
            val = showEmojis(data.addresser, data.body);
            var html
            html = `<div class="chat-item item-left clearfix rela">
                 
            <div> <span class="abs uname">${data.addresser}</span>
            <span class="fl pimg">${val}</span>
            </div>`
            $('#' + hex_md5(data.addresser) + ' .chat-msg').append(html);
            console.log(hex_md5(data.addresser));
            scrollToBottom(hex_md5(data.addresser));
        });


        function sendMessage2(head, val) {
            console.log(head)
            val = showEmojis(head, val);
            // $('.chat-active .chat-msg').append('<li><img class="mehead" src="' + head + '"><span class="mespeak">' + val + '</span></li>');
            var html
            html = `<div class="chat-item item-right clearfix">
                    <span class="abs uname">me</span>
                    <span class="message fr">${val}</span>
                    </div>`
            $('.chat-active .chat-msg ').append(html);


        }


        //重要
        //active li //切換私聊聊天室
        $(document).on('click', '#session li', function() {
            //原本的私人聊天室側面人物部分由active變為class空白
            $('.active').removeClass('active');
            $(this).addClass('active');
            //
            var index = $(this).index();

            //切換私聊聊天室
            $('.chat-active').removeClass('chat-active');
            $('.chat:eq(' + index + ')').addClass('chat-active');


            afterhtml();
        });




        //表情包傳送??

        // $(document).on('click', '.chat-active .emoji', function() {
        //     $('#emoji').css('display', 'block');
        // });



        function scrollToBottom(root) {
            $('#' + root + ' .body').scrollTop($('#' + root + ' .chat-msg').height());
        }

        // $('#emoji span').click(function() {
        //     var val = $('.chat-active input[type=text]').val();

        //     $('.chat-active input[type=text]').val(val + $(this).text());
        //     $('#emoji').css('display', 'none');
        // });
        ////part2


        /*按下send按鈕*/
        $('.sendBtn').click(function() {
            sendMessage()
        });


        /*按下Enter*/
        $(document).keydown(function(evt) {
            if (evt.keyCode == 13) {
                sendMessage()
            }
        })

        //多人聊天
        function sendMessage() {
            let txt = $('#sendtxt').val();

            $('#sendtxt').val('');
            if (txt) {
                /*觸發 sendMessage 事件*/
                socket.emit('sendMessage', {
                    username: myName,
                    message: txt
                });
            }
        }
        // //單人發送图片
        // $('.chat-active #sendimg-s').change(function() {
        //     console.log('觸發單人照片傳送')
        //     var file = this.files[0];
        //     //借助H5中的FileReader读取文件并发送到服务器
        //     var fr = new FileReader();
        //     var kname = $(".chat-active p").html()
        //     fr.readAsDataURL(file);

        //     fr.onload = function() { //讀取完成
        //         showImg2(kname, this.result);
        //         socket.emit('sendImg-s', {
        //             username: kname,
        //             img: this.result
        //         });
        //     }
        // });







        // $('.sendimg').click(function() {
        //     sendImg()
        // });

        // function sendImg() {
        //     console.log('觸發照片傳送')
        //     let Imginput = document.getElementById('tupian');
        //     let file = Imginput.files[0];
        //     let reader = new FileReader();
        //     reader.readAsDataURL(file);

        //     reader.onload = function() {
        //         // let data = { img: this.result };
        //         // socket.emit('sendImg', data);

        //         socket.emit('sendImg', {
        //             username: myName,
        //             img: this.result
        //         });

        //     }
        // }
        //多人發送图片
        $('#sendimg').change(function() {
            console.log('觸發照片傳送')
            var file = this.files[0];
            //借助H5中的FileReader读取文件并发送到服务器
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function() { //读取完成
                // socket.emit('sendImg', {
                //     userName: userName,
                //     avatar: avatar,
                //     img: fr.result //读取结果
                // })
                // let data = { img: this.result };
                // socket.emit('sendImg', data);
                socket.emit('sendImg', {
                    username: myName,
                    img: this.result,

                });
            }
        });

        socket.on('receiveImg', function(data) {
            showImg(data)
        })


        /*監聽 receiveMessage事件*/
        socket.on('receiveMessage', function(data) {
            showMessage(data)
        })

        /*顯示訊息*/
        function showMessage(data) {
            data.message = showEmoji(data.message);
            var html;
            if (data.username === myName) {
                html = `<div class="chat-item item-right clearfix">
                <span class="abs uname">me</span>
                <span class="message fr">${data.message}</span>
            </div>`
            } else {
                html = `<div class="chat-item item-left clearfix rela">
                <span class="abs uname">${data.username}</span>
                <span class="fl message">${data.message}</span>
            </div>`
            }
            $('.chat-con').append(html);
            //致底
            $(' .chat-wrap-main').scrollTop($(' .chat-wrap-main' + ' .chat-con').height());
        }

        /*顯示圖片*/
        function showImg(data) {

            var html;
            // html = `<div class="chat-item item-right clearfix">
            // <span class="abs uname">me</span>
            // <div><img src="${data.img}" /> </div>

            // </div>`

            if (data.username === myName) {
                html = `<div class="chat-item item-right clearfix">
                     <span class="abs uname">me</span>
                     <span class="fl pimg"><img style="width:600px;height:350px;" src="${data.img}" /> </span>

             </div>`
            } else {
                html = `<div class="chat-item item-left clearfix rela">
                 
                 <div> <span class="abs uname">${data.username}</span>
                 <span class="fl pimg"><img style="width:600px;height:350px;" src="${data.img}" /> </span>
             </div>`
            }
            $('.chat-con').append(html);
            $(' .chat-wrap-main').scrollTop($(' .chat-wrap-main' + ' .chat-con').height());
        }





        /*單個私人聊天室*/
        function incomeHtml(tname, head) {

            //hex_md5 進行加密標籤 頭像暱稱
            // $('#session').append('<li id="li' + hex_md5(tname) + '"><img src="' + head + '"> <span class="nick-name">' + tname + '</span> </li>');
            $('#session').append('<li id="li' + hex_md5(tname) + '"><img src="' + head + '"> <span class="nick-name">' + tname + '</span> </li>');

            //每個人的私人聊天室
            var html = '';
            //data-n 放名稱 ， class="chat" 代表 chat-active
            html += '<div id="' + hex_md5(tname) + '" data-n="' + tname + '" class="chat"><div class="main">';
            html += '<div class="message"><div class="head"><p>' + tname + '</p></div>';
            html += '<div class="body"><ul class="chat-msg"></ul></div></div>';
            // html += '<div class="footer"><div class="box"> <div id="emojiWrapper2"></div><div class="head"><input id="emo-s" type="button" value="emo" title="emo" /><label for="sendimg-s" class="imageLable-s"><input class="sendtup-s" type="button" value="image"  /><input id="sendimg-s" type="file" value="image"/></label>';
            html += '<div class="footer"><div class="box">  <div id="emojiWrapper2' + hex_md5(tname) + '" class="emojiWrapper2"></div><div class="head"><input class="emo-s" type="button" value="emo" title="emo" /><label for="sendimg-s" class="imageLable-s"><input class="sendtup-s" type="button" value="image"  /><input id="sendimg-s" type="file" value="image"/></label>';
            //emoji 表情包class
            // html += '<svg class="icon emoji" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4692" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><path d="M520.76544 767.05792c-99.14368 0-180.30592-73.65632-193.78176-169.09312l-49.22368 0c13.78304 122.624 116.61312 218.29632 242.91328 218.29632S749.81376 720.5888 763.5968 597.9648l-49.0496 0C701.0816 693.4016 619.90912 767.05792 520.76544 767.05792zM512 0C229.23264 0 0 229.2224 0 512c0 282.75712 229.23264 512 512 512 282.76736 0 512-229.24288 512-512C1024 229.2224 794.76736 0 512 0zM511.95904 972.78976C257.46432 972.78976 51.1488 766.48448 51.1488 512c0-254.49472 206.30528-460.81024 460.81024-460.81024 254.48448 0 460.8 206.30528 460.8 460.81024C972.75904 766.48448 766.44352 972.78976 511.95904 972.78976zM655.57504 456.92928c31.06816 0 56.24832-25.1904 56.24832-56.24832 0-31.06816-25.18016-56.24832-56.24832-56.24832-31.06816 0-56.25856 25.18016-56.25856 56.24832C599.31648 431.73888 624.49664 456.92928 655.57504 456.92928zM362.73152 456.92928c31.06816 0 56.24832-25.1904 56.24832-56.24832 0-31.06816-25.1904-56.24832-56.24832-56.24832-31.0784 0-56.25856 25.18016-56.25856 56.24832C306.47296 431.73888 331.65312 456.92928 362.73152 456.92928z" p-id="4693"></path></svg>';
            html += '</div><div class="body"> <input type="text" placeholder="Type a message" id="ip3' + hex_md5(tname) + '" class="ip3" /></div>';
            //send 傳送 chat-active
            // html += '<div class="foot"><a class="send" href="javascript:void(0)">發送(Enter)</a></div></div></div></div></div>';
            html += '<div class="foot"> <button class="send"><img src = "images/send.png" ></button></div ></div></div > ';

            $('#chat').append(html);
            initialEmojis();



            function initialEmojis() {
                var emojiContainers = document.getElementById('emojiWrapper2' + hex_md5(tname) + ''),
                    docFragments = document.createDocumentFragment();
                for (var i = 69; i > 0; i--) {
                    var emojiItems = document.createElement('img');
                    emojiItems.src = '../images/emoji/' + i + '.gif';
                    emojiItems.title = i;
                    docFragments.appendChild(emojiItems);
                };
                emojiContainers.appendChild(docFragments);
            }
        }



        function emoclik() {
            $(".chat-active .emojiWrapper2").on('click', function(e) {
                // console.log(kname)
                var target = e.target;

                if (target.nodeName.toLowerCase() == 'img') {
                    var ktxt = $(".chat-active .ip3").val()
                    var kname = $(".chat-active p").html()
                    console.log(kname)
                    var messageInput = document.getElementById('ip3' + hex_md5(kname) + '');
                    console.log(messageInput)
                    messageInput.focus();
                    messageInput.value = ktxt + '[emoji:' + target.title + ']';

                };


            })

        }

        function afterhtml() {


            var iconWrapper;


            $(".chat-active .emo-s").on('click', function() {
                var kname = $(".chat-active p").html()
                let div_chat = $(this).parents('div.chat');
                iconWrapper = div_chat.find('#emojiWrapper2' + hex_md5(kname) + '');
                if (iconWrapper.css("display") == "block") {
                    iconWrapper.hide();
                } else {
                    iconWrapper.show();
                    emoclik()
                }

            })

            //單人發送图片
            $('.chat-active #sendimg-s').change(function() {
                console.log('觸發單人照片傳送')
                var file = this.files[0];
                //借助H5中的FileReader读取文件并发送到服务器
                var fr = new FileReader();
                var recipient = $('.chat-active').attr('data-n');

                fr.readAsDataURL(file);

                fr.onload = function() { //讀取完成
                    showImg2(myName, recipient, this.result);
                    socket.emit('sendImg-s', {

                        nusername: recipient,
                        username: myName,
                        img: this.result
                    });
                }

            });


        }

        function showImg2(data, recipient2, sinimg) {


            var html
            html = `<div class="chat-item item-right clearfix">
                    <span class="abs uname">me</span>
                    <span class="message fr"><img style="width:600px;height:350px;" src="${sinimg}" /></span>
                    </div>`
            $('.chat-active .chat-msg').append(html)
            scrollToBottom(hex_md5(recipient2))


            // '#' + hex_md5(data.username) + ' .chat-msg'
            console.log(data)

        }


        //單人顯示圖片
        socket.on('receiveImg-s', function(data) {

            console.log('接收到單人照片傳送')
            console.log(data.username)
            console.log(data.nusername)
            if (data.username == data.nusername) return;

            var html
            html = `<div class="chat-item item-left clearfix rela">
         
                <div> <span class="abs uname">${data.username}</span>
                <span class="fl pimg"><img style="width:600px;height:350px;" src="${data.img}" /> </span>
                </div>`
            $('#' + hex_md5(data.username) + ' .chat-msg').append(html);
            console.log(hex_md5(data.username));
            scrollToBottom(hex_md5(data.username));
        });

        function showEmojis(sname, msg) {
            var el = document.getElementById('emojiWrapper2' + hex_md5(sname) + '')
            console.log(el)
            var match, result = msg,
                reg = /\[emoji:\d+\]/g,
                emojiIndex,
                totalEmojiNum = document.getElementById('emojiWrapper2' + hex_md5(sname) + '').children.length;

            while (match = reg.exec(msg)) {
                emojiIndex = match[0].slice(7, -1);
                if (emojiIndex > totalEmojiNum) {
                    result = result.replace(match[0], '[X]');
                } else {
                    result = result.replace(match[0], '<img class="emoji" src="../images/emoji/' + emojiIndex + '.gif" />');
                };
            };

            return result;
        }


        //多人聊天室情感傳送

        initialEmoji();

        document.getElementById('emo').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;

            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('sendtxt');
                // console.log(messageInput)
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);

        function initialEmoji() {
            var emojiContainer = document.getElementById('emojiWrapper'),
                docFragment = document.createDocumentFragment();
            for (var i = 69; i > 0; i--) {
                var emojiItem = document.createElement('img');
                emojiItem.src = '../images/emoji/' + i + '.gif';
                emojiItem.title = i;
                docFragment.appendChild(emojiItem);
            };
            emojiContainer.appendChild(docFragment);

        }

        function showEmoji(msg) {
            var match, result = msg,
                reg = /\[emoji:\d+\]/g,
                emojiIndex,
                totalEmojiNum = document.getElementById('emojiWrapper').children.length;
            while (match = reg.exec(msg)) {
                emojiIndex = match[0].slice(7, -1);
                if (emojiIndex > totalEmojiNum) {
                    result = result.replace(match[0], '[X]');
                } else {
                    result = result.replace(match[0], '<img class="emoji" src="../images/emoji/' + emojiIndex + '.gif" />');
                };
            };
            return result;
        }


    })