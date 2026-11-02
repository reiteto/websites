//
// @magnusthemes json tumblr post generator
//

// function to format text blocks
function createText(content) {
    let texts = content.text

    // if there is no text, don't return anything else
    if (content.text === '') return ''

    // initialize output string
    let output = ""

    // if there is formatted content
    if (content.formatting) {
        let characters = Array.from(texts.split(''))
        for (const [i, text] of characters.entries()) {
            const char = texts[i]

            // look for end of format
            const endFormatTypes = content.formatting.filter((f) => f.end === i);

            // for each type, create a closing tag
            for (const f of endFormatTypes) {
                if (f.type === "link") {
                    output += "</a>"
                }
                if (f.type === "color") {
                    output += "</span>"
                }
                if (f.type === "bold") {
                    output += "</b>"
                }
                if (f.type === "small") {
                    output += "</span>"
                }
                if (f.type === "mention") {
                    output += "</a>"
                }
                if (f.type === "italic") {
                    output += "</i>"
                }
                if (f.type === "strikethrough") {
                    output += "</strike>"
                }
            }

            // look for start of format
            const startFormatTypes = content.formatting.filter((f) => f.start === i);

            // for each type, create an opening tag 
            for (const f of startFormatTypes) {
                if (f.type === "link") {
                    output += `<a href="${f.url}">`
                }
                if (f.type === "color") {
                    output += `<span style="color:${f.hex}">`
                }
                if (f.type === "bold") {
                    output += `<b>`
                }
                if (f.type === "small") {
                    output += `<span style="font-size:0.85em">`
                }
                if (f.type === "mention") {
                    output += `<a className="mention" href="${f.blog.url}">`;
                }
                if (f.type === "italic") {
                    output += `<i>`
                }
                if (f.type === "strikethrough") {
                    output += `<strike>`
                }
            }

            if (char === '<') output += '&lt;'
            else if (char === '>') output += '&gt;'
            else output += char
            // output += char
        }
    }
    // if no formatting, just output the text 
    else output += texts.replaceAll('<','&lt;').replaceAll('>','&gt;')

    // text is output line by line,
    // so we handle the list grouping separately later
    if (content.subtype === "unordered-list-item" || content.subtype === "ordered-list-item") {
        let li = document.createElement('li')
        li.classList.add(content.subtype)
        li.innerHTML = output
        return li
    }
    // create an element to put the formatted text in, and then return it  
    else {
        let p = document.createElement('p')
        p.classList.add(content.subtype)
        output = output.replace(/\n/g,'<br>')
        p.innerHTML = output
        return p
    }
}

// create audio posts 
function createAudio(content) {
    // make new wrapper
    let audioWrapper = document.createElement('div')
    audioWrapper.classList.add('audio-wrapper')
    
    // check if it's a tumblr audio post
    // if yes, use the html native player
    // if the native player is unavailable, use an embed
    if (content.provider == "tumblr"){
        try {
            let newAudio = createPlayer(content)
            audioWrapper.appendChild(newAudio)
        } 
        catch(e) {
            audioWrapper.innerHTML = content.embed_html
        }
    } 
    else audioWrapper.innerHTML = content.embed_html
    return audioWrapper
}

// function to create native audio elements
function createPlayer(content){
    // read the metadata of the track
    var metaData = {
        title: content.title?content.title:'',
        artist: content.artist?content.artist:'',
        album: content.album?content.album:'',
        url: content.url?content.url:decodeURIComponent(content.embed_html.split('audio_file=')[1].split('"')[0]),
        img: content.poster[0].url
    }

    // make a new audio player with the correct url
    var newAudio = new Audio(metaData.url)
    var newBox = document.createElement("div")
    newBox.appendChild(newAudio)
    newBox.classList = "audio container"
    
    // add the albumart and track info to the player
    // not the best way to do it... maybe fix another time
    newBox.innerHTML += '<div class="albumart"><img src="'+metaData.img+'"></div>'
    newBox.innerHTML += '<div class="musicinfo"><table><td style="vertical-align:middle;"><b>'+metaData.title+'</b><br>'+metaData.artist+' - '+metaData.album+'</td></table></div>'
    
    // make the play button
    var newPlayer = document.createElement("a")
    newPlayer.classList = "audioplay"
    
    // bind click events to the play button
    // (i.e. make the audio play on click)
    var pauseIcon = '<span class="ti ti-player-pause-filled"></span>'
    var playIcon = '<span class="ti ti-player-play-filled"></span>'
    newPlayer.innerHTML = playIcon
    newPlayer.addEventListener("click",function(){
        if (newAudio.paused){
            newAudio.play()
            newPlayer.innerHTML = pauseIcon
        } else {
            newAudio.pause()
            newPlayer.innerHTML = playIcon
        }
    });
    newAudio.addEventListener("ended",function(){
        newAudio.pause()
        newAudio.currentTime = 0;
        newPlayer.innerHTML = playIcon
    });
    newBox.appendChild(newPlayer)
    return newBox
}

// function to create polls
function createPoll(content, permalink) {
    let id = permalink.substring(permalink.lastIndexOf("/") + 1);
    let poll = document.createElement('div')
    poll.classList.add('poll')
    poll.append(content.question)
    content.answers.map((answers) => {
        let answer = document.createElement('a')
        answer.classList.add('poll-option')
        answer.target = "_blank"
        answer.href = `https://tumblr.com/${ user }/${ id }`
        answer.innerHTML = answers.answer_text
        poll.append(answer)
    })
    return poll
}

// function to create links
function createLink(content) {
    let link = document.createElement('a')
    link.classList.add('post-link')
    link.href = content.url
    let poster = content.poster 
    let posterImage = document.createElement('div')
    posterImage.classList.add('poster-content')
    if (poster) {
        posterImage.classList.add('poster-with-image')
        posterImage.style.backgroundImage = `url(${content.poster[0].url})`
        posterImage.innerHTML = `<span class="link-title">${content.title}`
    } else {
        posterImage.innerHTML = `<span class="link-title">${content.title}`
    }
    link.append(posterImage)
    if (content.description) {
        let description = document.createElement('span')
        description.classList.add('link-descr')
        description.textContent = content.description
        link.append(description)
    }
    let source = document.createElement('span')
    source.classList.add('link-source')
    source.innerHTML = `${content.site_name != null ? content.site_name : ''} | ${content.author != null ? content.author : ''}`

    if (content.author && content.site_name) link.append(source)
    return link
}
     
// function to create image with lightbox 
function createImage(media) {
     let image = document.createElement('img')
     let anchor = document.createElement('a')
     image.src = media.url
     anchor.classList.add('post_media_photo_anchor')
     anchor.setAttribute('data-big-photo', media.url)
     anchor.setAttribute('data-big-photo-height', media.height)
     anchor.setAttribute('data-big-photo-width', media.width)
     image.setAttribute('srcset', media.url)
     image.classList.add('post_media_photo', 'image')
     anchor.append(image)
     return anchor
}

// create content inside of each row  
function createRow(content, permalink) {
    // sort through content types      
    switch (content.type) {
        case 'text':
            let textWrapper = document.createElement('div')
            textWrapper.classList.add('text-content')
            textWrapper.append(createText(content))
            return textWrapper
            break;

        case 'image':
            return createImage(content.media[0])
            break;

        case 'audio':
            return createAudio(content)
            break;

        case 'link':
            return createLink(content)
            break;

        case 'video':
            if (content.provider === 'tumblr') {
                let video = document.createElement('video')
                video.src = content.url
                video.controls = true
                return video
            } else {
                let video = document.createElement('iframe')
                video.classList.add('video-iframe')
                video.src = content.embed_iframe?.url ?? content.media.url
                let videoWidth = content.embed_iframe?.width ?? content.media.width
                let videoHeight = content.embed_iframe?.height ?? content.media.height
                video.style.aspectRatio = `${ videoWidth } / ${ videoHeight }`
                return video
            }
            break;

        case 'poll':
            return createPoll(content, permalink)
            break;

        // in case there are new post types/types that were missed
        default:
            return `this ${content.type} npf block is not supported yet`
    }
}

// create each row  
function createRows(id, content, layout, permalink, trail = null) {
    let rows = document.createElement('div')
    rows.classList.add('content')

    // if there are indexes with asks 
    let asks = []

    // if there are layouts
    if (layout.length) {

        // if there are rows
        let hasRows = layout.every(v => v.type === 'rows');
        layout.map((layout) => {
            if (hasRows) {

                // if there are displays 
                if (layout.display) {

                    // create individual rows
                    layout.display.map((display) => {
                        let row = document.createElement('div')
                        row.classList.add(`flex`, `content-rows`, `row-size-${display.blocks.length}`)

                        if (display.blocks) {
                            display.blocks.map((block) => {

                                // if there's a readmore then exit
                                // also make a readmore link before exiting
                                // also only do this on either the index page or if the original post is not ours
                                if (layout.truncate_after!=undefined && (indexPage || trail != null))
                                    if (block>layout.truncate_after){
                                        if (block-1 == layout.truncate_after){
                                            let newRow = document.createElement('div')
                                            newRow.classList.add('text-content')
                                            newRow.append(createMore(permalink))
                                            row.append(newRow)
                                            rows.append(row)
                                        }
                                        return
                                    }

                                // if no readmore we continue as per normal
                                row.append(createRow(content[block], permalink))

                                // add a special class for photo posts so that we can group them into photosets
                                if (content[block].type === 'image') row.classList.add('photo')

                                rows.append(row)
                            })
                        }

                    })
                }
            }

            // if there are no rows
            else {
                // if layout is an ask
                if (layout.type === 'ask') {

                    let ask = document.createElement('div')
                    ask.classList.add('question')
                    let asker = document.createElement('a')
                    // let askerIcon = document.createElement('img')
                    asker.classList.add('asker')

                    if (layout.attribution) {
                        asker.innerHTML = `${layout.attribution.blog.name}`
                        // askerIcon.src = `https://api.tumblr.com/v2/blog/${layout.attribution.blog.name}/avatar/64`
                    } else {
                        // askerIcon.src = "https://assets.tumblr.com/pop/src/assets/images/avatar/anonymous_avatar_96-223fabe0.png"
                        asker.innerHTML = `<span>anonymous</span>`
                    }

                    // rows.append(askerIcon)
                    ask.append(asker)
                    rows.classList.add('ask')

                    asks = layout.blocks
                    if (layout.blocks) {
                        layout.blocks.map((block) => {
                            ask.append(createRow(content[block], permalink))
                            rows.append(ask)
                        })
                    }
                }
                // if it is a reply
                if (!layout.display) {

                    // create styling for replies
                    let answer = document.createElement('div')
                        answer.classList.add('question', 'answer')
                    let asker = document.createElement('a')
                        asker.classList.add('asker')
                    // let askerIcon = document.createElement('img')

                    // if answerer has a valid url
                    if (trail) {
                        asker.innerHTML = `${trail.name}`
                        // askerIcon.src = `https://api.tumblr.com/v2/blog/${trail.name}/avatar/64`
                        answer.append(asker)
                    }  else asker.innerHTML = '${ user }'
                    
                    content.map((block, index) => {

                        // if block is not part of the original ask
                        if (asks.indexOf(index) === -1) {

                            // if the reply is not part of a trail
                            if (!trail) answer.classList.remove('question')
                            answer.append(createRow(block,permalink))
                            rows.append(answer)
                        }
                    })
                }

                // to produce readmores for answer posts is a bit tricky
                // this block of code handles original replies
                if (layout.type === 'rows' && layout.truncate_after!=undefined){
                    if(indexPage || rows.querySelectorAll(".question").length > 1){
                        Array.from(rows.querySelector(".answer").children).filter(child => !child.classList.contains('asker')).forEach((row,index) => {
                            if(index>=layout.truncate_after) {
                                if(index == layout.truncate_after) {
                                    if(row.classList.contains('.text-content')){
                                        row.replaceChildren();
                                        row.appendChild(createMore(permalink))
                                    } else {
                                        let newDiv = document.createElement('div')
                                        newDiv.appendChild(createMore(permalink))
                                        newDiv.classList.add('text-content')
                                        row.parentNode.replaceChild(newDiv,row)
                                    }

                                } else row.remove()
                            }
                        })
                    }
                }
            }
        })

    // no layout
    } else {
        content.map((block) => {
            if (layout.truncate_after!=undefined && indexPage)
                if (block>layout.truncate_after){
                    rows.append(createMore(permalink))
                    return
                }
            rows.append(createRow(block, permalink))
        })
    }
    return rows
}

// function to group list items into a single list (by chatgpt)
function createLists(container){
    const textContentDivs=container.querySelectorAll('.text-content');
    let currentList = null;
    let currentListContainer = null;

    textContentDivs.forEach((div) => {
        const items = div.querySelectorAll('.ordered-list-item,.unordered-list-item');

        if (items.length > 0) {
            if (!currentList) {
                const firstItemClass = items[0].classList.contains('ordered-list-item') ? 'ol' : 'ul';
                currentList = document.createElement(firstItemClass);
                currentListContainer = div;
            }
            items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = item.innerHTML; 
                currentList.appendChild(listItem);
                if (item.parentNode != currentListContainer)
                    item.parentNode.remove()
                else item.remove()
            });
            
        } else {
            // If a non-list item element is encountered, finalize the current list
            if (currentList) {
                currentListContainer.appendChild(currentList);
                currentList = null;
                currentListContainer = null;
            }
        }
    });
    if (currentList) currentListContainer.appendChild(currentList);
    container.querySelectorAll(".content-rows").forEach((div) => {
        const items = div.querySelectorAll(".text-content")
        if (items.length){
            items.forEach((item) => {
                if(!item.innerHTML) item.remove()
            })
        } else {
            if(!div.textContent.trim() && div.children.length === 0) div.remove()
        }
    })
}

// function to make a new readmore link
function createMore(url){
    let newLink = document.createElement("a")
    newLink.classList.add("read_more")
    newLink.href = url
    newLink.innerHTML = "Keep reading..."
    let newP = document.createElement("p")
    newP.appendChild(newLink)
    return newP
}

// function to generate post notes (unused, maybe in future)
function postNotes(url) {
    let postNotesData = ""
    let postNotesDiv = document.createElement('div')
    let httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function (data) {
        postNotesData = data.srcElement.response
    }
    httpRequest.open("GET", url)
    httpRequest.send()
    postNotesDiv.innerHTML = postNotesData
    return postNotesDiv
}

// function to generate the headers of each reblog item
function createHeader(blogName, theBlog, postID, active, tumblrmart_accessories) {

    // create reblog header link and avatar img
    let blogURL = theBlog.endsWith('/')?theBlog.slice(0, -1):theBlog
    let reblogHeader = document.createElement('a')
    let thePost = postID?'/'+postID:''
    reblogHeader.href = blogURL+thePost
    // let userAvatar = `<img class="user-avatar" src="https://api.tumblr.com/v2/blog/${ blogName }/avatar/64">`
    let userClass = active?'ti-user-edit':'ti-user-x'
    let userAvatar = `<span class="user-avatar ti ${ userClass }"></span>`
    reblogHeader.innerHTML = `${ userAvatar } <span class="active-${ active } usernames">${ blogName }</span>`
    
    // will only show the image if a user is active
    // reblogHeader.innerHTML = `${active ? userAvatar : ''} <span class="active-${ active } usernames">${ blogName }</span>`
    
    // determine if there are checkmarks
    let checkmarks = tumblrmart_accessories?.blue_checkmark_count
    if (checkmarks) {
        let checks = ''
        let checkmarkContainer = document.createElement('span')
        checkmarkContainer.classList.add('checkmarks')
        // checkmarks are 2 per purchase
        let total = checkmarks * 2
        // loop through each purchased checkmark + double it
        for (var i = 0; i < checkmarks * 2; i++) {
            // there are 12 official colors, if it is within the first 12, just use the index 
            if (i <= 11) {
                checks += `<span class="checkmark" style="left: calc( 0% + 80% * (${i + 1}/${ total })) "><img src="https://assets.tumblr.com/images/tumblrmart/badges/rainbow/${[ i + 1 ]}.png"></span>`
            }
            // if it's not, we do a little math
            else {
                // math is not my strength i apologize in advance
                let math = (i + 1) - ((Math.ceil((i + 1) / 12) - 1) * 12)
                checks += `<span class="checkmark" style="left: calc( 0% + 80%* (${i + 1}/${ total })) "><img src="https://assets.tumblr.com/images/tumblrmart/badges/rainbow/${ math }.png" ></span>`
            }
        }
        // add the checkmarks to the reblog header
        checkmarkContainer.innerHTML = checks
        // if there's more than 12, add some styling to prevent them from overflowing
        if (total > 12) {
            reblogHeader.classList.add('big-checkmarks')
        }
        reblogHeader.append(checkmarkContainer)
    }
    // return reblog header content
    return reblogHeader
}

// function to decode npf strings (by chatgpt)
function html_entity_decode(inputString) {
    return inputString.replace(/\\(?:x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4})|([^xu\s])|&[a-zA-Z]+;?)/g, function(match, hex, unicode, char) {
        if (hex || unicode) 
            return String.fromCharCode(parseInt(hex || unicode, 16));
        else if (char) 
            return char;
        else {
            var element = document.createElement('div');
            return element.innerHTML = match, element.textContent;
        }
    });
}

// function to initialize npf content
function npfInit(post){

    // get npf data
    let article = post
    let npf_data = post.querySelector('.npf_data')
    let npf;
    try {
        npf = JSON.parse(html_entity_decode(npf_data.textContent.slice(1,-1)))
    } catch(e) {
        npf = JSON.parse(npf_data.innerHTML)
    }
    let permalink = npf_data.getAttribute('data-permalink').slice(1,-1)

    // if there is a reblog trail 
    if (npf.trail) {
        npf.trail.map((trail, index) => {

            // create header and content 
            let trailed = document.createElement('div')
            let header = document.createElement('div')
            if (index === 0) {
                header.classList.add('original-poster')
            }
            header.classList.add('reblog-header')
            if (trail.blog) {
                header.append(createHeader(trail.blog.name, trail.blog.url, trail.post.id, trail.blog.can_be_followed, trail.blog.tumblrmart_accessories))
            } else {
                let brokenBlog = document.createElement('span')
                brokenBlog.classList.add('broken-blog', 'usernames')
                brokenBlog.innerHTML = trail.broken_blog_name
                header.append(brokenBlog)
            }
            trailed.append(createRows(post.id, trail.content, trail.layout, permalink, trail.blog))
            createLists(trailed)

            // fix readmore links urls
            trailed.querySelectorAll("a.read_more").forEach((link) => {
                let theBlog = trail.blog.url
                let postID = trail.post.id
                let blogURL = theBlog.endsWith('/')?theBlog.slice(0, -1):theBlog
                let reblogHeader = document.createElement('a')
                let thePost = postID?'/'+postID:''
                link.href = blogURL+thePost
            })

            // add header and trail to the post element
            article.append(header, trailed)
        })
    }

    // if it is an original post  
    if (npf.content.length > 0) {
        let content = document.createElement('div')
        let header = document.createElement('div')
        header.classList.add('reblog-header', 'original-poster')
        header.append(createHeader(user, `https://${ user }.tumblr.com`, npf_data.getAttribute('data-id').slice(1,-1), true, null))
        content.append(createRows(post.id, npf.content, npf.layout, permalink))
        createLists(content)
        article.append(header, content)
    }
    // renders askbox/submit box
    if (bodyElement.contains('askpermalink-page') || bodyElement.contains('submit-permalink-page')) {
        let inbox = document.createElement('div')
        let inbox_data = post.querySelector('.npf_inbox').textContent
        inbox_data = inbox_data.substring(inbox_data.indexOf('<iframe'));
        inbox.classList.add('text-content')
        inbox.innerHTML = inbox_data
        article.append(inbox)
    }
}
