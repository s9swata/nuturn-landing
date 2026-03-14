# [Build from sources - Documentation | Lightpanda](https://lightpanda.io/docs/open-source/guides/build-from-sources) 
 _https://lightpanda.io/docs/open-source/guides/build-from-sources_

## Prerequisites[](#prerequisites)
Lightpanda is written with [Zig](https://ziglang.org/)  `0.14.0`. You will have to install it with the right version in order to build the project.
You need also to install [Rust](https://rust-lang.org/tools/install/)  for building deps.
Lightpanda also depends on [zig-js-runtime](https://github.com/lightpanda-io/zig-js-runtime/)  (with v8), [Libcurl](https://curl.se/libcurl/)  and [html5ever](https://github.com/servo/html5ever) .
To be able to build the v8 engine for zig-js-runtime, you have to install some libs:
**For Debian/Ubuntu based Linux:**
 sudo apt install xz-utils ca-certificates \
 pkg-config libglib2.0-dev \
 clang make curl git
**For MacOS, you need [Xcode](https://developer.apple.com/xcode/)  and the following pacakges from homebrew:**
## Build and run[](#build-and-run)
You an build the entire browser with `make build` or `make build-dev` for debug env.
But you can directly use the zig command to run in debug mode:
ℹ️
The build will download and build V8. It can takes a lot of time, more than 1 hour. You can save this part by donwloading manually a \[pre-built\]([https://github.com/lightpanda-io/zig-v8-fork/releases](https://github.com/lightpanda-io/zig-v8-fork/releases)  version) and use the `-Dprebuilt_v8_path=` option.
### Embed v8 snapshot[](#embed-v8-snapshot)
Lighpanda uses v8 snapshot. By default, it is created on startup but you can embed it by using the following commands:
Generate the snapshot.
 zig build snapshot_creator -- src/snapshot.bin
Build using the snapshot binary.
 zig build -Dsnapshot_path=../../snapshot.bin
See ＃1279   for more details.
[Usage](https://lightpanda.io/docs/open-source/usage "Usage")[Configure a proxy](https://lightpanda.io/docs/open-source/guides/configure-a-proxy "Configure a proxy")

# [Lightpanda Now Supports robots.txt](https://lightpanda.io/blog/posts/robotstxt-support) 
 _https://lightpanda.io/blog/posts/robotstxt-support_

### Muki Kiboigo
#### Software Engineer
Friday, February 20, 2026
## TL;DR[](#tldr)
We shipped support into Lightpanda’s main branch. When you pass , the browser fetches and parses the robots.txt file for every domain it touches before making any requests. The implementation fetches once per root domain and manages a cache per session.
## Why This Matters for Machine Traffic[](#why-this-matters-for-machine-traffic)
is a plain text file that lives at the root of a domain, typically at . It describes which paths a crawler should and shouldn’t access, and for which user agents those rules apply. The format has been around for a while and is also known as [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309) .
A typical file looks like:
The key thing to understand is that is not a security mechanism. It requires clients to be good web citizens and to respect the intentions of the site owner. Google honors it, and so do most reputable crawlers.
The volume of machine-generated web traffic has grown substantially and a meaningful portion of it ignores the conventions that made large-scale crawling sustainable in the first place. Sites are spending meaningful resources dealing with bot traffic they never consented to.
## Our Position[](#our-position)
Lightpanda is a browser for machines and we want it to be the default infrastructure for AI agents, scrapers, and automation pipelines. That goal only makes sense if machine traffic becomes a better citizen of the web.
We built robots.txt support because we think it should be easy to do the right thing. That said, we are not the end user here. Lightpanda is a tool, and like any browser, what you do with it is your responsibility.The feature is currently opt-in via .
If you’re building a product that crawls third-party websites, respecting robots.txt is good practice. It reduces the chance your traffic gets rate-limited or blocked and it’s the kind of behavior that keeps the web functional for everyone.
## Parsing a Robots File[](#parsing-a-robots-file)
We implemented our own Robots parser, living in [](https://github.com/lightpanda-io/browser/blob/main/src/browser/Robots.zig). It follows the rules set out in [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309) , ensuring that we capture all of the rules that apply to our User-Agent.
The parser handles the standard robots.txt directives: , , and .
User-Agent matching uses case-insensitive comparison, ensuring that , , and all match the same rule block.
For path matching, the implementation handles the wildcard and the end-of-path anchor that the RFC defines. These are quite important and are used extensively in the real world.
## The Singleflight Problem[](#the-singleflight-problem)
One important thing to consider is the behavior when a page loads resources from the same domain concurrently.
Consider a script, , that fetches 3 additional JavaScript files from . Without any coordination, the browser would fire off 3 separate requests for before any of those JavaScript requests would proceed. On a real world page, this would lead to many redundant requests.
The solution is to make one request to the and queue all of the additional requests after it. This way, we only fetch and parse the once and amortize that cost across all of the subsequent requests.
**Without Singleflight**
**With Singleflight**
The first request to a domain that needs kicks off the robots fetch and registers the actual request in a queue keyed by robots URL.
1. Subsequent requests to the same domain while is still in flight add themselves to that queue instead of firing a new robots fetch.
2. When the response arrives, the browser parses and caches the result into a to be shared across the session.
3. The browser checks all of the queued requests, fetching their resources if they are allowed or blocking them if they are disallowed.
This means you only ever fetch once per session, regardless of how many resources come from that domain.
Internally, the queue is stored in the HTTP client as , a hash map from robots URL to a list of pending requests. When we finish fetching the robots.txt file, the callback drains the queue:
Blocked requests get a error that propagates up through the same callback chain as any other HTTP error.
## Checking Every Domain[](#checking-every-domain)
If you’re using , you’re explicitly signaling that you want to behave like a crawler. Crawlers check for every domain they fetch resources from. RFC 9309 doesn’t carve out an exception for subresources. This means that all requests are checked against the robots.txt of their domain.
[Google’s own documentation](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec) shows examples where site owners explicitly configure rules for CSS and JS files, highlighting the expected behavior of subresources being governed.
## How to Use It[](#how-to-use-it)
If you’re running Lightpanda locally:
When is set, every HTTP request goes through the check before it’s made. Requests to domains that disallow your user-agent get blocked with a log warning. Requests to domains with no , or that permits access, proceed normally.
The user-agent is what the rules match against, but use the option to append your own identity.
## What’s Next[](#whats-next)
We’re thinking about exposing check results through the CDP interface, so automation clients can inspect why a request was blocked rather than just seeing an error.
If you’re building on top of Lightpanda and have opinions about how handling should work in your use case, we’d like to [hear from you](mailto:hello@lightpanda.io).
You can see the full implementation in [PR #1407](https://github.com/lightpanda-io/browser/pull/1407)  and explore the source at [github.com/lightpanda-io/browser](https://github.com/lightpanda-io/browser) .
## FAQ[](#faq)
### What is robots.txt?[](#what-is-robotstxt)
is a text file at the root of a domain that tells crawlers which paths they should and shouldn’t access. It’s a convention, not a security mechanism. Crawlers that honor it check the file before making requests.
### Why is robots.txt support opt-in?[](#why-is-robotstxt-support-opt-in)
Lightpanda is a tool. Like any browser, what you do with it is your responsibility. We don’t enforce compliance by default. The flag lets you choose to respect it when that’s appropriate for your use case.
### Does Lightpanda check robots.txt for subresources?[](#does-lightpanda-check-robotstxt-for-subresources)
Yes. When is enabled, Lightpanda checks robots.txt for every domain it fetches resources from, not just the origin. This matches how crawlers behave and follows [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309) .
### How does the singleflight cache work?[](#how-does-the-singleflight-cache-work)
When multiple requests need from the same domain, the first request fetches it and subsequent requests queue behind it. When the fetch completes, all queued requests are evaluated at once. You only fetch each file once per session.
### What happens when a request is blocked by robots.txt?[](#what-happens-when-a-request-is-blocked-by-robotstxt)
The request fails with a error and a warning is logged. The error propagates through the same callback chain as other HTTP errors, so your automation scripts can handle it.
### Can I configure which domains to check?[](#can-i-configure-which-domains-to-check)
Currently applies to all domains. We may add finer-grained control in the future. If you have specific requirements, [let us know](mailto:hello@lightpanda.io).
### Does this affect performance?[](#does-this-affect-performance)
There is a performance impact from making an additional request but the singleflight pattern and the session cache minimizes the performance impact, making only one request per domain we encounter.
* * *
### Muki Kiboigo
#### Software Engineer
Muki is a computer engineer from Seattle with a background in systems programming. He is the author of open-source Zig projects like zzz, an HTTP web framework, and tardy, an async runtime. He also runs a website at muki.gg. At Lightpanda, he works on the core browser engine.

# [Posts Tagged with “performance”](https://lightpanda.io/blog/tags/performance) 
 _https://lightpanda.io/blog/tags/performance_

CTRL K
## [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.[Read More →](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Fri Feb 27 2026
## [Why Request Interception Matters](https://lightpanda.io/blog/posts/why-request-interception-matters)
How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.[Read More →](https://lightpanda.io/blog/posts/why-request-interception-matters)
Tue Feb 10 2026
## [From Local to Real World Benchmarks](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.[Read More →](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
Tue Jan 27 2026
## [Migrating our DOM to Zig](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.[Read More →](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
Thu Jan 08 2026
## [Why We Built Lightpanda in Zig](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025
## [The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.[Read More →](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Mon Nov 24 2025
## [What Is a True Headless Browser?](https://lightpanda.io/blog/posts/what-is-a-true-headless-browser)
We explore the difference between a consumer browser in headless mode versus a true headless browser built for machines.[Read More →](https://lightpanda.io/blog/posts/what-is-a-true-headless-browser)
Fri Nov 14 2025
## [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.[Read More →](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Fri Nov 07 2025
## [Lightpanda browser now uses libcurl](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl[Read More →](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
Wed Jul 16 2025
## [Why build a new browser? From intuition to reality](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?[Read More →](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Wed May 28 2025

# [Posts Tagged with “scraping”](https://lightpanda.io/blog/tags/scraping) 
 _https://lightpanda.io/blog/tags/scraping_

 Posts Tagged with “scraping” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “scraping”
## [Why build a new browser? From intuition to reality](/blog/posts/why-build-a-new-browser)
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?[Read More →](/blog/posts/why-build-a-new-browser)
Wed May 28 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Why build a new browser? <br /> From intuition to reality](https://lightpanda.io/blog/posts/why-build-a-new-browser) 
 _https://lightpanda.io/blog/posts/why-build-a-new-browser_

### Francis Bouvier
#### Cofounder & CEO
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question: what would a browser look like if it were built specifically for machines? Not primarily for rendering interfaces built for humans.
We released Lightpanda’s beta in November 2024 and today we’re excited to share more about the technical journey to this point.
## Lessons from browsing the web at scale[](#lessons-from-browsing-the-web-at-scale)
Lightpanda’s founding team worked together at BlueBoard, a SaaS platform that tracked product visibility and pricing across thousands of e-commerce sites globally. BlueBoard’s infrastructure crawled over 20 million pages per day, relying on a massive fleet of headless Chrome instances orchestrated across dozens of servers.
Maintaining this setup was a constant battle between scaling limits, memory leaks, brittle page loads, and frequent crashes. The browser layer became the most fragile and expensive part of the stack. We spent 15% of our annual revenue keeping this infrastructure online. That was a clear signal: the ecosystem needed a tool built from first principles, designed for automation at scale. Lightpanda is the browser we wish we had back then.
Traditional browsers, like Chrome, are resource-intensive because they are designed for graphical rendering and user interactivity. But headless Chrome, the de facto solution, is suboptimal:
* **High resource usage**: even in headless mode, Chrome calculates graphical output
* **Instability**: running multiple instances of Chrome requires frequent restarts
* **Cost**: scaling headless Chrome-based solutions demands significant hardware resources
## What is a web browser?[](#what-is-a-web-browser)
A web browser is a program that retrieves and displays information from web servers. Typically, browsers perform three key functions:
1. **Fetching content**: sending HTTP requests to a server and receiving responses
2. **Rendering pages**: processing HTML and CSS to display visually rich pages
3. **Executing code**: running JavaScript and interacting with web APIs to enable dynamic content and actions
For Lightpanda, the goal was to address the first and third functions while omitting graphical rendering. The thesis was that this critical difference would unlock efficiencies with a significant order of magnitude and make it well adapted for web automation.
## Our first instinct: fork and optimize Chrome[](#our-first-instinct-fork-and-optimize-chrome)
Our initial idea was to start from Chromium (the open-source version of Chrome) and optimize it for machine use. By stripping out graphical rendering and other superfluous components, we hoped to create a lighter browser while benefitting from the battle-tested foundation that would allow us to maintain maximum compatibility with the modern web.
But we quickly ran into the limitations of that approach. Chromium’s codebase is not designed to be modular. Cleanly separating the graphical rendering from the rest of the browser is extremely difficult. Chromium is the product of nearly three decades of development, forks, and layering. Blink (the rendering engine behind Chromium) is a fork of Webkit (Safari), which is a fork of KHTML (Konqueror, a Linux browser now deprecated).
More importantly, we realized that starting from Chrome didn’t allow us to fully follow through on the vision. We didn’t want to hack a human-facing browser for machine tasks. We wanted to design a browser built for machines from the ground up. To do that, we had to take the harder path: building it from scratch.
## Technical approach[](#technical-approach)
### Building from scratch[](#building-from-scratch)
Rebuilding a browser, even in headless mode, is a colossal task. It doesn’t make sense if the performance and efficiency gains are not an order of magnitude better than existing solutions. Before we wrote a single line of code, our thesis was that anything less than a 10x improvement would not justify the complexity.
The core architecture of Lightpanda consists of:
1. **HTML parsing and DOM manipulation**
2. **JavaScript engine**
3. **Networking layer**
4. **Web APIs**
5. **CDP server** - for compatibility with client script libraries like Puppeteer and Playwright
### Language Choice: Zig[](#language-choice-zig)
A browser needs to be written in a system programming language. We chose Zig for its balance between low-level control and developer-friendly features. Key advantages include:
* **Explicit memory management**: Zig’s allocators allow fine-grained control over memory usage, which is critical for performance optimization
* **Compile-time execution**: Zig’s comptime feature simplifies the generation of boilerplate code, reducing runtime complexity and useful to generate the numerous Web APIs
* **Interoperability**: Zig integrates seamlessly with C/C++ libraries, enabling us to leverage existing solutions like V8 (Javascript engine) and Netsurf libraries (HTML parsing and DOM tree)
### Why V8 as a JavaScript engine?[](#why-v8-as-a-javascript-engine)
Since building a new browser from scratch is already a massive undertaking, we didn’t want to take on the added complexity of developing a new JavaScript engine. Instead, we chose to integrate an existing one: V8, the JavaScript engine used in Chrome and Node.js. It was selected for its:
* **Performance**: optimized for executing modern JavaScript
* **Documentation and Ecosystem**: a rich ecosystem of resources and examples
* **Flexibility**: well-suited for embedding into custom applications, and it’s also able to execute WASM code
Like any technical choice, this one comes with trade-offs. V8 is a powerful engine, but it’s also large and complex. In the future, we may explore lighter alternatives for more constrained or specialized use cases.
### Web APIs: scope and prioritization[](#web-apis-scope-and-prioritization)
Modern web browsers implement over 300 web APIs, encompassing thousands of methods and types. For the beta version of Lightpanda, we prioritized APIs essential for web automation, such as:
* **DOM manipulation**: accessing and modifying HTML elements.
* **XHR and Fetch**: handling asynchronous HTTP requests.
* **Basic JavaScript functions**: supporting common operations needed by automation scripts.
## Validating the vision[](#validating-the-vision)
After several months of development, perseverance and belief in the vision, we reached a key milestone. Our early results confirmed both the performance hypothesis and the technical feasibility of building a browser from scratch.
To validate behavior against web standards, we integrated the [Web Platform Tests](https://wpt.fyi/)  into our development pipeline. Maintained collaboratively by browser vendors, these tests helped us identify missing APIs and ensure consistent implementation across supported features.
On a representative test page, Lightpanda is 11 times faster than headless Chrome and uses 9 times less memory. Startup time, a critical factor in serverless and CI/CD contexts, is nearly instantaneous. In our benchmarks, Lightpanda launches over 30 times faster than Chrome.
These results were not achieved by optimizing around a single bottleneck. They reflect the cumulative impact of rebuilding the browser architecture. By removing the graphical layer, designing specifically for automation use cases, and choosing a high-performance system language, we validated that a fundamentally more efficient browser is possible.
## Beyond performance[](#beyond-performance)
With this foundation in place, we now have all the core building blocks needed to fulfill our vision: a browser purpose-built for machines. The next step is to expand our web API coverage in order to improve compatibility across a broader range of websites.
Just as importantly, building our own browser has given us deep control over the web automation stack. This unlocks new possibilities, such as a native MCP server to control the browser remotely and LLM-friendly output formats to facilitate integration with AI agents. These are the kinds of features that are difficult to build cleanly on top of traditional browsers. They require deep integration, which is only possible when you control the stack end to end.
Lightpanda is open source and available on [GitHub](https://github.com/lightpanda-io/browser) . Feel free to reach out with questions or explore the repo for more technical details.
* * *
### Francis Bouvier
#### Cofounder & CEO
Francis previously cofounded BlueBoard, an ecommerce analytics platform acquired by ChannelAdvisor in 2020. While running large automation systems he saw how limited existing browsers were for this kind of work. Lightpanda grew from his wish to give developers a faster and more reliable way to automate the web.

# [Posts Tagged with “robots”](https://lightpanda.io/blog/tags/robots) 
 _https://lightpanda.io/blog/tags/robots_

 Posts Tagged with “robots” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “robots”
## [Lightpanda Now Supports robots.txt](/blog/posts/robotstxt-support)
Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.[Read More →](/blog/posts/robotstxt-support)
Fri Feb 20 2026
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “javascript”](https://lightpanda.io/blog/tags/javascript) 
 _https://lightpanda.io/blog/tags/javascript_

## [The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.[Read More →](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Mon Nov 24 2025

# [Posts Tagged with “cdp”](https://lightpanda.io/blog/tags/cdp) 
 _https://lightpanda.io/blog/tags/cdp_

CTRL K
## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Native Markdown Output in Lightpanda](https://lightpanda.io/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](https://lightpanda.io/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.[Read More →](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Fri Feb 27 2026
## [Why Request Interception Matters](https://lightpanda.io/blog/posts/why-request-interception-matters)
How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.[Read More →](https://lightpanda.io/blog/posts/why-request-interception-matters)
Tue Feb 10 2026
## [CDP Under the Hood: A Deep Dive](https://lightpanda.io/blog/posts/cdp-under-the-hood)
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.[Read More →](https://lightpanda.io/blog/posts/cdp-under-the-hood)
Fri Nov 28 2025
## [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.[Read More →](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Fri Nov 07 2025

# [Configure a proxy - Documentation | Lightpanda](https://lightpanda.io/docs/open-source/guides/configure-a-proxy) 
 _https://lightpanda.io/docs/open-source/guides/configure-a-proxy_

Lightpanda supports HTTP and HTTPS proxies with basic or bearer authentication. You can configure the proxy when starting the browser.
## Configure HTTP proxy[](#configure-http-proxy)
Use the CLI option `--http_proxy` when starting Lightpanda to configure the proxy. Ensure your proxy address starts with `http://` or `https://`.
Use a local proxy with the `fetch` command:
 ./lightpanda fetch --http_proxy http://127.0.0.1:3000 https://lightpanda.io
Or configure the proxy with `serve` for the CDP server. All outgoing requests will use the proxy.
 ./lightpanda serve --http_proxy http://127.0.0.1:3000
### HTTP proxy with basic auth[](#http-proxy-with-basic-auth)
You can configure [basic auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication#basic)  for the proxy using the `username:password@` format in the proxy address. It works for both `fetch` and `serve` commands.
 ./lightpanda fetch --http_proxy 'http://me:my-password@127.0.0.1:3000' https://lightpanda.io
### HTTP proxy with bearer auth[](#http-proxy-with-bearer-auth)
Lightpanda supports [bearer auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication#bearer)  to authenticate with the `--proxy_bearer_token`. It works for both `fetch` and `serve` commands.
This option will add a `Proxy-Authorization` header all the outgoing requests.
 ./lightpanda fetch --http_proxy 'http://127.0.0.1:3000' --proxy_bearer_token 'MY-TOKEN' https://lightpanda.io
## Configure a proxy from your Puppeteer/Playwright script[](#configure-a-proxy-from-your-puppeteerplaywright-script)
Instead of configuring your proxy auth on Lightpanda’s start, you can pass your username and password in flight from your script using request interceptions.
### Puppeteer[](#puppeteer)
With Puppeteer, you have to configure the proxy address when starting Lightpanda.
 ./lightpanda fetch --http_proxy 'http://127.0.0.1:3000'
Then you can call `page.authenticate` function to inject your authentication from your script.
 const page = await context.newPage();
 
 // Set credentials for HTTP Basic Auth
 await page.authenticate({
 username: 'my_username',
 password: 'my_password',
 });
You can find the full example in our [demo repository](https://github.com/lightpanda-io/demo/blob/main/puppeteer/proxy_auth.js) .
### Playwright[](#playwright)
With Playwright, configure the proxy when creating the browser’s context.
 const context = await browser.newContext({
 baseURL: baseURL,
 proxy: {
 server: 'http://127.0.0.1:3000',
 username: 'my_username',
 password: 'my_password',
 },
 });
 
 const page = await context.newPage();
You can find the full example in our [demo repository](https://github.com/lightpanda-io/demo/blob/main/playwright/proxy_auth.js) .

# [Use Stagehand - Documentation | Lightpanda](https://lightpanda.io/docs/open-source/guides/use-stagehand) 
 _https://lightpanda.io/docs/open-source/guides/use-stagehand_

[Stagehand](https://www.stagehand.dev/)  is a popular, [open source](https://github.com/browserbase/stagehand)  AI Browser Automation Framework.
With Stagehand you can use natural language and code to control browser.
Since Lightpanda supports [Accessibilty tree](https://github.com/lightpanda-io/browser/pull/1308) , you can use it instead of Chrome with your Stagehand script.
## Install the Lightanda and Stagehand dependencies[](#install-the-lightanda-and-stagehand-dependencies)
If not set, create a new npm project and install Stagehand depencies.
 npm install @browserbasehq/stagehand @lightpanda/browser
## Write your Stagehand script with Lightpanda[](#write-your-stagehand-script-with-lightpanda)
Now you can create your Stagehand’s. script to connectm by editing `index.js` file.
 'use strict'
 
 import { lightpanda } from '@lightpanda/browser';
 
 import { Stagehand } from "@browserbasehq/stagehand";
 import { z } from "zod/v3";
 
 const lpdopts = { host: '127.0.0.1', port: 9222 };
 
 const stagehandopts = {
 // Enable LOCAL env to configure the CDP url manually in the launch options.
 env: "LOCAL",
 localBrowserLaunchOptions: {
 cdpUrl: 'ws://' + lpdopts.host + ':' + lpdopts.port,
 },
 // You need an ANTHROPIC_API_KEY env var.
 model: "anthropic/claude-haiku-4-5",
 verbose: 0,
 };
 
 (async () => {
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 
 try {
 // Connect Stagehand to the browser.
 const stagehand = new Stagehand(stagehandopts);
 
 await stagehand.init();
 
 // Impportant: in the official documentation, Stagehand uses the default
 // existing page. But Lightpanda requires an explicit page's creation
 // instead.
 const page = await stagehand.context.newPage();
 
 await page.goto('https://demo-browser.lightpanda.io/amiibo/', {waitUntil: "networkidle"});
 const name = await stagehand.extract("Extract character's name", z.string());
 console.log("===", name);
 
 await stagehand.close()
 
 } finally {
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
 }
 })();
## Run your script[](#run-your-script)
Before running you script, make sure you have a valid Anthropic api key exported into the env var `ANTHROPIC_API_KEY`. You can also use [another model](https://docs.stagehand.dev/v3/configuration/models)  supported by Stagehand.
You should see in the following logs:
[Configure a proxy](https://lightpanda.io/docs/open-source/guides/configure-a-proxy "Configure a proxy")[Systems requirements](https://lightpanda.io/docs/open-source/systems-requirements "Systems requirements")

# [Posts Tagged with “announcement”](https://lightpanda.io/blog/tags/announcement) 
 _https://lightpanda.io/blog/tags/announcement_

CTRL K
## [Native Markdown Output in Lightpanda](https://lightpanda.io/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](https://lightpanda.io/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.[Read More →](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Fri Feb 27 2026
## [Lightpanda browser now uses libcurl](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl[Read More →](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
Wed Jul 16 2025
## [Lightpanda raises pre-seed to develop the first browser built for machines and AI](https://lightpanda.io/blog/posts/lightpanda-raises-preseed)
We’re excited to share that Lightpanda has raised a pre-seed round to build the first browser designed from the ground up for machines.[Read More →](https://lightpanda.io/blog/posts/lightpanda-raises-preseed)
Tue Jun 10 2025

# [Index](https://lightpanda.io/docs/) 
 _https://lightpanda.io/docs/_

## What is Lightpanda?[](#what-is-lightpanda)
Lightpanda is an AI-native web browser built from scratch for machines. Fast, scalable web automation with a minimal memory footprint.
Made for headless usage:
* Javascript execution
* Support of Web APIs
* Compatible with [Playwright](https://playwright.dev/) , [Puppeteer](https://pptr.dev/)  through CDP
Fast web automation for AI agents, LLM training, scraping and testing:
* Ultra-low memory footprint (10x less than Chrome)
* Exceptionally fast execution (10x faster than Chrome)
* Instant startup
ℹ️
When using Lightpanda, we recommend that you respect `robots.txt` files and avoid high frequency requesting websites. DDOS could happen fast for small infrastructures.
Lightpanda can follow `robots.txt` for you, just pass the `--obey_robots` option.
Next step: [Installation and setup](https://lightpanda.io/docs/quickstart/installation-and-setup)

# [Posts Tagged with “rust”](https://lightpanda.io/blog/tags/rust) 
 _https://lightpanda.io/blog/tags/rust_

 Posts Tagged with “rust” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “rust”
## [Why We Built Lightpanda in Zig](/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “html”](https://lightpanda.io/blog/tags/html) 
 _https://lightpanda.io/blog/tags/html_

⌘K
## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Native Markdown Output in Lightpanda](https://lightpanda.io/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](https://lightpanda.io/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [CDP Under the Hood: A Deep Dive](https://lightpanda.io/blog/posts/cdp-under-the-hood)
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.[Read More →](https://lightpanda.io/blog/posts/cdp-under-the-hood)
Fri Nov 28 2025
## [Why build a new browser? From intuition to reality](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?[Read More →](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Wed May 28 2025

# [The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be](https://lightpanda.io/blog/posts/the-real-cost-of-javascript) 
 _https://lightpanda.io/blog/posts/the-real-cost-of-javascript_

### Katie Brown
#### Cofounder & COO
Monday, November 24, 2025
## TL;DR[](#tldr)
The web has fundamentally changed. Modern sites rely heavily on JavaScript to render content, making traditional HTTP crawling obsolete. What used to require a simple GET request now demands a full browser with JavaScript execution. The web has shifted from server-rendered pages to client-side JavaScript applications. This change means traditional HTTP crawling is increasingly ineffective and has massive implications for anyone building tools that need to take actions on the web.
## The Old Web: Server-Rendered HTML[](#the-old-web-server-rendered-html)
Ten years ago, web crawling was straightforward. You made an HTTP request, parsed the HTML response, and extracted the data you needed. Libraries like BeautifulSoup and Scrapy were enough for most jobs. Today, that approach fails on the majority of modern websites.
In the early 2010s, most websites followed a simple pattern:
1. Browser requests a page
2. Server generates complete HTML
3. Browser displays it immediately
4. All content is in the initial HTML response
For crawlers, this was ideal. You could fetch the page with a simple HTTP client and parse the HTML.
The data you needed was right there in the HTML and no JavaScript was required.
## The Modern Web: JavaScript Everywhere[](#the-modern-web-javascript-everywhere)
Frameworks like React, Vue, and Angular are now everywhere and Single Page Applications (SPAs) have become the standard. The shift happened because these frameworks offered better user experiences: instant navigation, smooth transitions, and reactive interfaces.
But from a web automation perspective, the architecture is fundamentally different:
1. Browser requests a page
2. Server sends minimal HTML and JavaScript bundles
3. JavaScript executes and makes additional API calls
4. Content renders dynamically in the browser
5. User interactions trigger more JavaScript and API calls
The initial HTML response is often nearly empty because all the actual content gets loaded and rendered by JavaScript after the page loads.
## Why Traditional HTTP Crawling Fails[](#why-traditional-http-crawling-fails)
When you make a simple HTTP request to a modern website, you get the initial HTML shell. But the data you need isn’t there yet. It only appears after:
1. JavaScript bundles download and parse
2. JavaScript executes and makes API calls
3. API responses return and render
This breaks the old crawling approach completely. Let’s look at a couple of concrete examples.
### Example 1: Infinite Scroll[](#example-1-infinite-scroll)
Social media feeds and search results increasingly use infinite scroll. The initial page load shows 20 items. More items only appear when you scroll, triggering JavaScript that:
1. Detects scroll position
2. Makes an API call for the next batch
3. Renders new items at the bottom
4. Repeats when you scroll further
A traditional crawler making one HTTP request will only see those initial 20 items. The rest of the content is inaccessible without JavaScript execution or forging specific XHR/fetch requests.
### Example 2: Dynamic Content Loading[](#example-2-dynamic-content-loading)
News sites, dashboards, and analytics tools now load content dynamically:
1. Article comments load after the main content
2. Charts render with JavaScript visualization libraries
3. Real-time data updates via WebSocket connections
4. Content changes based on user behavior or A/B tests
None of this is visible with static HTTP requests.
## The HTTP vs. Browser Automation Divide[](#the-http-vs-browser-automation-divide)
This architectural shift created two fundamentally different approaches to web automation:
### Approach 1: HTTP Clients (Old Way)[](#approach-1-http-clients-old-way)
**Tools**: curl, axios, fetch or any language’s HTTP client
**How it works:**
1. Makes HTTP GET/POST requests
2. Receives HTML/JSON responses
3. Parses static content
**Pros:**
* Fast (milliseconds per request)
* Lightweight (minimal memory)
* Easy to scale horizontally
* Simple to understand and debug
* Get JS rendered content by forging XHR/fetch requests
**Cons:**
* Only works on server-rendered sites
* Getting JS rendered content is hard to create and harder to maintain
* Can’t interact with dynamic elements
* Fails on modern SPAs
* You have to parse the HTML yourself to extract data
### Approach 2: Browser Automation with CDP (New Reality)[](#approach-2-browser-automation-with-cdp-new-reality)
**Tools:** Puppeteer, Playwright, ChromeDP (all using Chrome DevTools Protocol)
**How it works:**
1. Launches a full browser instance
2. Navigates to the page
3. Waits for JavaScript to execute
4. Extracts data from the fully rendered DOM
**Pros:**
* Sees all JavaScript-rendered content
* Can interact with dynamic elements
* Handles infinite scroll, lazy loading, SPAs
* Renders pages exactly as users see them
* Execute data extraction directly in the browser
**Cons:**
* Slow (seconds per page instead of milliseconds)
* Heavy (hundreds of MB of memory per instance)
* Complex to deploy, scale and maintain
* Expensive infrastructure costs
The shift to browser automation wouldn’t be practical without the combination of Chrome DevTools Protocol (CDP) and Chrome in headless mode.
CDP is the interface that allows programmatic control of Chrome and Chromium-based browsers giving full control of the browser through a straightforward API.
Chrome in headless mode removes the requirement to have a display server on the host, allowing faster execution and reduced memory consumption.
Before headless mode and CDP, browser automation meant Selenium with headful browsers, which controlled browsers through the WebDriver protocol.
CDP provides:
* Direct control over the browser
* Access to the DOM after JavaScript execution
* Network interception and modification
* Fast, bidirectional communication
* Downloads, cache, screenshots and more
Puppeteer (2017) and Playwright (2020) popularized CDP-based automation, making it the standard for modern crawling. They provide high level APIs for common tasks.
This works on modern JavaScript-heavy sites, but it comes at a massive cost.
## When HTTP Crawling Still Works[](#when-http-crawling-still-works)
Not every site requires browser automation. You should still use HTTP clients when:
* **The site is server-rendered:** WordPress blogs, documentation sites, government portals
* **Data is in the initial HTML:** Static content, traditional CMSs
* **Speed matters more than coverage:** Quick monitoring that doesn’t need complete data
But increasingly, these are the exception, not the rule.
### Why Not Just Use APIs?[](#why-not-just-use-apis)
If websites provide an API to access data on a website, why not fetch data from those APIs directly?
APIs don’t routinely expose what users see. They expose what websites want you to access.
When you need to simulate human behavior, the only reliable way to do this is to use a browser. Monitoring prices as they appear to customers, tracking what content is actually displayed, verifying how your competitors present information requires mirroring the actual user experience on the website, not the API.
## The Modern Web Automation Stack[](#the-modern-web-automation-stack)
Today’s web automation architecture requires multiple approaches:
1. **Try HTTP first:** Fastest and cheapest when it works
2. **Detect when JavaScript is needed:** Check if initial HTML contains target data
3. **Fall back to browser automation:** Use CDP-based tools for JavaScript heavy sites
4. **Optimize browser usage:** Reuse instances, minimize page loads, target specific elements
This hybrid approach balances cost and coverage. But it adds complexity, you’re now maintaining two completely different systems.
## What This Means for AI Agents[](#what-this-means-for-ai-agents)
The JavaScript problem becomes even more critical for AI agents browsing the web. When an LLM needs to extract information from websites:
* It can’t rely on simple HTTP requests
* It needs to execute JavaScript to see the actual content
* This requires running a full browser per agent task
* The infrastructure costs multiply with agent scale
This is why lightweight browsers matter. A browser that can execute JavaScript without all the rendering overhead changes the economics of web automation.
## The Future of Web Automation[](#the-future-of-web-automation)
The web isn’t going back to server-rendered HTML. JavaScript frameworks are only getting more sophisticated. Web Assembly is adding even more client-side computation. Real-time features via WebSockets are becoming standard.
This means browser automation isn’t a temporary necessity, it’s the permanent foundation of modern web automation.
The real cost of JavaScript isn’t just the computation, it’s the infrastructure required to run it. And that cost is only going up.
## Ready to Reduce Your Browser Automation Costs?[](#ready-to-reduce-your-browser-automation-costs)
If you’re running browser automation at scale and the infrastructure costs are adding up, Lightpanda can help.
We built a browser from scratch for automation workloads: fast startup, minimal memory footprint, and full JavaScript execution without the rendering overhead.
* [Get started](https://lightpanda.io/docs/quickstart/installation-and-setup)  and run your first Lightpanda script in under 10 minutes
* [Read the docs](https://lightpanda.io/docs/cloud-offer/tools/cdp)  to learn how to connect with Puppeteer or Playwright
* [Star the project](https://github.com/lightpanda-io/browser)  on GitHub to stay up to date with the latest developments
* * *
### Katie Brown
#### Cofounder & COO
Katie led the commercial team at BlueBoard, where she met Pierre and Francis. She rejoined them on the Lightpanda adventure to lead GTM and to keep the product closely aligned with what developers actually need. She also drives community efforts and, by popular vote, serves as chief sticker officer.

# [Posts Tagged with “puppeteer”](https://lightpanda.io/blog/tags/puppeteer) 
 _https://lightpanda.io/blog/tags/puppeteer_

 Posts Tagged with “puppeteer” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “puppeteer”
## [New LP Domain Commands and Native MCP](/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Native Markdown Output in Lightpanda](/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [CDP Under the Hood: A Deep Dive](/blog/posts/cdp-under-the-hood)
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.[Read More →](/blog/posts/cdp-under-the-hood)
Fri Nov 28 2025
## [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.[Read More →](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Fri Nov 07 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [CDP](https://lightpanda.io/docs/cloud-offer/tools/cdp) 
 _https://lightpanda.io/docs/cloud-offer/tools/cdp_

## Chrome Devtool Protocol
Use the [Chrome Devtool Protocol](https://chromedevtools.github.io/devtools-protocol/)  (CDP) to connect to browsers. Most of existing tools to control a browser like Puppeteer, Playwright or chromedp are compatible with CDP.
## Usage[](#usage)
Depending on your location, you can connect to the CDP using the url `wss://euwest.cloud.lightpanda.io/ws` or `wss//uswest.cloud.lightpanda.io/ws`.
You have to add your token as query string parameter: `token=YOUR_TOKEN`.
 // Server in west europe
 wss://euwest.cloud.lightpanda.io/ws?token=TOKEN
 // Server in west US
 wss://uswest.cloud.lightpanda.io/ws?token=TOKEN
### Options[](#options)
The CDP url takes options to configure the browser as query string parameters.
#### Browser[](#browser)
By default, the CDP serves [Lightpanda browsers](https://github.com/lightpanda-io/browser) . But you can select Google Chrome browser using `browser=chrome` parameter in the url. `browser=lightpanda` forces the usage of Lightpanda browser.
 wss://euwest.cloud.lightpanda.io/ws?browser=chrome&token=TOKEN
#### Proxies[](#proxies)
**fast\_dc**
You can configure proxies for your browser with `proxy` query string parameter. By default, the proxy used is `fast_dc`, a single shared datacenter IP.
**datacenter**
Set `datacenter` proxy to use a pool of shared datacenter IPs. The IPs rotate automatically.
`datacenter` proxy accepts an optional `country` query string parameter, a two letter country code.
Example using a german IP with a lightpanda browser.
 wss://euwest.cloud.lightpanda.io/ws?proxy=datacenter&country=de&token=TOKEN
Please [contact us](mailto:hello@lightpanda.io) to get access to additional proxies for your specificc use case or to configure your own proxy with Lightpanda Cloud offer.
The service
## Connection examples[](#connection-examples)
You can find more script examples in the [demo](https://github.com/lightpanda-io/demo/)  repository.
### Playwright[](#playwright)
Use Lightpanda CDP with [Playwright](https://playwright.dev/) .
 import playwright from "playwright-core";
 
 const browser = await playwright.chromium.connectOverCDP(
 "wss://euwest.cloud.lightpanda.io/ws?token=TOKEN",
 );
 const context = await browser.newContext();
 const page = await context.newPage();
 
 //...
 
 await page.close();
 await context.close();
 await browser.close();
More examples in [demo/playwright](https://github.com/lightpanda-io/demo/tree/main/playwright) .
### Puppeteer[](#puppeteer)
Use Lightpanda CDP with [Puppeteer](https://pptr.dev/) .
 import puppeteer from 'puppeteer-core';
 
 const browser = await puppeteer.connect({
 browserWSEndpoint: "wss://euwest.cloud.lightpanda.io/ws?token=TOKEN",
 });
 const context = await browser.createBrowserContext();
 const page = await context.newPage();
 
 // ...
 
 await page.close();
 await context.close();
 await browser.disconnect();
More examples in [demo/puppeteer](https://github.com/lightpanda-io/demo/tree/main/puppeteer) .
### Chromedp[](#chromedp)
Use Lightpanda CDP with [Chromedp](https://github.com/chromedp/chromedp) .
 package main
 
 import (
 	"context"
 	"log"
 
 	"github.com/chromedp/chromedp"
 )
 
 func main() {
 	ctx, cancel := chromedp.NewRemoteAllocator(context.Background(),
 	"wss://euwest.cloud.lightpanda.io/ws?token=TOKEN", chromedp.NoModifyURL,
 	)
 	defer cancel()
 
 	ctx, cancel = chromedp.NewContext(ctx)
 	defer cancel()
 
 	var title string
 	if err := chromedp.Run(ctx,
 	chromedp.Navigate("https://lightpanda.io"),
 	chromedp.Title(&title),
 	); err != nil {
 	log.Fatalf("Failed getting title of lightpanda.io: %v", err)
 	}
 
 	log.Println("Got title of:", title)
 }
More examples in [demo/chromedp](https://github.com/lightpanda-io/demo/tree/main/chromedp) .

# [Native Markdown Output in Lightpanda](https://lightpanda.io/blog/posts/native-markdown-output) 
 _https://lightpanda.io/blog/posts/native-markdown-output_

### Adrià Arrufat
#### Software Engineer
## TL;DR[](#tldr)
Lightpanda now converts HTML to markdown natively inside the browser. You can use it from the CLI with or programmatically via a custom CDP command . The conversion happens at the DOM level, after JavaScript execution, so you get the actual rendered content. For AI agents, this means up to 80% fewer tokens per page with zero external dependencies.
## HTML Is Expensive for Machines[](#html-is-expensive-for-machines)
If you’re building AI agents that browse the web, you already know this problem. You navigate to a page, extract the HTML and feed it to an LLM. Most of that HTML is noise: navigation bars, script tags, style attributes, wrapper divs. None of it carries semantic value, yet it all consumes tokens.
A typical web page might contain 1,000 words of actual content but produce 8,000-10,000 tokens of HTML when you account for all the markup. Markdown preserves the content and its structure (headings, links, lists, tables) while stripping everything else. Cloudflare [measured this on their own blog](https://blog.cloudflare.com/markdown-for-agents/) . A post that took 16,180 tokens in HTML dropped to 3,150 tokens in markdown; that’s an 80% reduction.
The usual approach is to do this conversion outside the browser. You fetch the HTML, pipe it through a conversion library, clean up the output, and hope nothing important was lost. That works, but it adds a dependency and another failure point. As well as processing time you didn’t need to spend.
Since we’re building Lightpanda from scratch for machines, we control the whole codebase and wanted to take a different approach: we built the conversion directly into the browser.
## How It Works[](#how-it-works)
Lightpanda’s markdown conversion operates on the DOM tree after JavaScript has executed. This is an important distinction. You’re not converting raw HTML source code but the live document, the same one a user would see after all client-side rendering has completed.
The converter walks the DOM and translates each node into its markdown equivalent. Headings become # syntax. Links become . Lists, tables, code blocks, emphasis: all handled. Elements with no semantic meaning (like and wrappers) are ignored. Script and style elements are excluded entirely.
There are two ways to use it.
## CLI: The Flag[](#cli-the---dump-markdown-flag)
If you use Lightpanda’s fetch command, you can now pass to get markdown output directly:
This fetches the page, executes JavaScript, and prints the markdown representation to stdout. No browser session, CDP, or scripting. Useful for quick extraction or piping into other tools.
## CDP: The Command[](#cdp-the-lpgetmarkdown-command)
For programmatic use, Lightpanda exposes a custom CDP command under its own LP domain. This integrates with your existing Puppeteer or Playwright scripts.
Here is how it looks with Puppeteer:
And with Playwright:
The key detail: you call and get back an object with a property containing the converted content. No external libraries or post-processing pipeline.
## Converting Specific Elements[](#converting-specific-elements)
You do not always need the entire page as markdown. Sometimes you only care about the article body, or a specific section. The CDP command supports converting a sub-portion of the page by targeting specific DOM nodes.
This is useful when you want to skip headers, footers, and sidebars and extract only the content that matters for your AI workflow. Less noise means fewer tokens and better results from your LLM.
## Why This Matters for AI Agents[](#why-this-matters-for-ai-agents)
The shift toward markdown as the standard format for AI consumption is well underway. Cloudflare recently launched [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)  at the CDN layer. Tools like [Claude Code](https://docs.anthropic.com/en/docs/claude-code)  already send headers when fetching web content.
However, these approaches require either the origin server or a CDN to support markdown conversion, and many sites do not. When your AI agent navigates to an arbitrary website, you cannot rely on the server providing markdown.
Lightpanda solves this at the browser level. Because the conversion happens inside the browser, it works on any website. The browser fetches the page, executes the JavaScript, builds the DOM, and converts the result to markdown. No cooperation from the server required.
For AI agent architectures, this changes the economics:
* **Token reduction**: Up to 80% fewer input tokens per page means lower API costs and more room in your context window for actual reasoning.
* **No external dependencies**: The conversion is built into the browser. No separate library to install, update, or debug.
* **Post-JavaScript content**: Unlike server-side conversion, this captures dynamically rendered content. SPAs, lazy-loaded data, client-side routing: all visible in the output.
* **Targeted extraction**: Convert only the parts of the page you need, reducing noise further.
## The LP Domain[](#the-lp-domain)
The command is the first in a new custom CDP domain we are introducing: . This domain will be the home for Lightpanda-specific capabilities that go beyond what standard CDP offers.
We wrote extensively about [CDP’s limitations for automation](https://lightpanda.io/blog/posts/cdp-under-the-hood) . The protocol was built for debugging, not for machines. The domain is where we can build commands that make sense for automation-first use cases, without being constrained by a protocol designed for Chrome DevTools.
Markdown output is the first, but more commands are coming.
## Get Started[](#get-started)
Try the markdown output today. The [quickstart guide](https://lightpanda.io/docs/quickstart/installation-and-setup)  will get you running in under 10 minutes. Working examples for both [Puppeteer](https://github.com/lightpanda-io/demo/blob/main/puppeteer/markdown.js)  and [Playwright](https://github.com/lightpanda-io/demo/blob/main/playwright/markdown.js)  are in the demo repo.
* * *
## FAQ[](#faq)
### What format does the markdown output use?[](#what-format-does-the-markdown-output-use)
The output follows standard CommonMark markdown syntax. Headings, links, images, lists, tables, code blocks, and emphasis are all supported. Elements without semantic meaning (like layout divs) are omitted.
### Does the markdown conversion happen before or after JavaScript execution?[](#does-the-markdown-conversion-happen-before-or-after-javascript-execution)
After. The converter walks the live DOM tree, so it captures all dynamically rendered content. This means SPAs and pages that load content via JavaScript produce accurate markdown output.
### Can I convert only part of a page to markdown?[](#can-i-convert-only-part-of-a-page-to-markdown)
Yes. The CDP command supports targeting specific DOM nodes, so you can extract only the content you care about rather than the entire document.
### How much does markdown reduce token usage compared to HTML?[](#how-much-does-markdown-reduce-token-usage-compared-to-html)
It depends on the page. Pages with heavy markup (navigation, footers, ads, script tags) see the largest reductions. Cloudflare measured an 80% reduction on their blog. Content-heavy pages with minimal markup will see smaller but still meaningful reductions.
### Does this work with Lightpanda Cloud?[](#does-this-work-with-lightpanda-cloud)
Yes. The command works the same way whether you run Lightpanda locally or connect to [Lightpanda Cloud](https://console.lightpanda.io/signup) .
### Is the LP domain compatible with standard CDP?[](#is-the-lp-domain-compatible-with-standard-cdp)
The domain is a Lightpanda-specific extension. It is not part of the Chrome DevTools Protocol specification. Standard CDP commands continue to work as expected. The LP domain adds new capabilities on top.
### Do I need to install any additional libraries?[](#do-i-need-to-install-any-additional-libraries)
No. The markdown conversion is built into the Lightpanda browser binary. There are no external dependencies.
* * *
### Adrià Arrufat
#### Software Engineer
Adrià is an AI engineer at Lightpanda, where he works on making the browser more useful for AI workflows. Before Lightpanda, Adrià built machine learning systems and contributed to open-source projects across computer vision and systems programming.

# [Installation](https://lightpanda.io/docs/open-source/installation) 
 _https://lightpanda.io/docs/open-source/installation_

Open source edition
Installation
## One-liner installer[](#one-liner-installer)
For Linux or MacOSx users, you can install Lightpanda with following command. For Windows, take a look at the [dedicated section](#windows--wsl2).
 curl -fsSL https://pkg.lightpanda.io/install.sh | bash
ℹ️
`curl`, `jq` and `sha256sum` are required to install Lightpanda with the one-liner installer.
By default the installer installs the last nightly build. But you can pick a specific release:
 curl -fsSL https://pkg.lightpanda.io/install.sh | bash -s "v0.2.5"
## Install from Docker[](#install-from-docker)
Lightpanda provides [official Docker images](https://hub.docker.com/r/lightpanda/browser)  for both Linux amd64 and arm64 architectures.
The following command fetches the Docker image and starts a new container exposing Lightpanda’s CDP server on port `9222`.
 docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly
## Install manually from the nightly builds[](#install-manually-from-the-nightly-builds)
The latest binary can be downloaded from the [nightly builds](https://github.com/lightpanda-io/browser/releases/tag/nightly)  for Linux and MacOS.
### Linux x86\_64[](#linux-x86_64)
 curl -L -o lightpanda \
 https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && \
 chmod a+x ./lightpanda
### Linux aarch64[](#linux-aarch64)
 curl -L -o lightpanda \
 https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-linux && \
 chmod a+x ./lightpanda
### MacOS aarch64[](#macos-aarch64)
 curl -L -o lightpanda \
 https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos && \
 chmod a+x ./lightpanda
### MacOS x86\_64[](#macos-x86_64)
 curl -L -o lightpanda \
 https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-macos && \
 chmod a+x ./lightpanda
## Windows + WSL2[](#windows--wsl2)
The Lightpanda browser is compatible to run on Windows inside WSL (Windows Subsystem for Linux). If WSL has not been installed before follow these steps (for more information see: [MS Windows install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) ). Install & open WSL + Ubuntu from an **administrator** shell:
1. `wsl --install`
2. — restart —
3. `wsl --install -d Ubuntu`
4. `wsl`
Once WSL and a Linux distribution have been installed the browser can be installed in the same way it is installed for Linux. Inside WSL install the Lightpanda browser:
 curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && \
 chmod a+x ./lightpanda
It is recommended to install clients like Puppeteer on the Windows host.
## Telemetry[](#telemetry)
By default, Lightpanda collects and sends usage telemetry. This can be disabled by setting an environment variable `LIGHTPANDA_DISABLE_TELEMETRY=true`. You can read Lightpanda’s privacy policy at: [https://lightpanda.io/privacy-policy](https://lightpanda.io/privacy-policy) .
[4\. Go to production](https://lightpanda.io/docs/quickstart/go-to-production-with-lightpanda-cloud "4. Go to production")[Usage](https://lightpanda.io/docs/open-source/usage "Usage")

# [From Local to Real World Benchmarks](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks) 
 _https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks_

### Pierre Tachoire
#### Cofounder & CTO
Tuesday, January 27, 2026
## TL;DR[](#tldr)
We’ve released a new benchmark that tests Lightpanda against Chrome on 933 demo web pages with JavaScript required. Our previous benchmark ran locally against a synthetic page, which left open questions about real-world performance. The new results show that Lightpanda’s efficiency gains hold up over the network: for 25 parallel tasks, Lightpanda used 123MB of memory versus Chrome’s 2GB (16x), and completed the crawl in 5 seconds versus 46 seconds (9x).
## The Questions We Needed to Answer[](#the-questions-we-needed-to-answer)
Since we launched Lightpanda, we never had a great answer for two big challenges we received repeatedly:
1. “Network time erases your gains.” Our first benchmark ran locally, which removed network latency. People reasonably asked whether our performance gains would disappear once network requests entered the picture.
2. “At scale, you use tabs, not processes.” In production, people typically run Chrome with multiple tabs rather than multiple processes. The concern was that Chrome’s tab-based resource sharing would close the gap at scale.
Fair points. So we built a new benchmark.
## Our Original Benchmark[](#our-original-benchmark)
Our first [“Campfire e-commerce” benchmark](https://github.com/lightpanda-io/demo/blob/main/BENCHMARKS.md#campfire-e-commerce-benchmark)  was designed to isolate browser performance from network variability. We serve a fake e-commerce product page from a local web server, then use Puppeteer to load the page and execute JavaScript. The page makes two XHR requests for product data and reviews, mimicking a real dynamic site.
This approach gave us clean, reproducible numbers. By running locally, we measure browser overhead without network noise. The results showed Lightpanda executing 11x faster than Chrome and using 9x less memory.
## The New Benchmark[](#the-new-benchmark)
The new “Crawler” benchmark tests against 933 demo web pages with JavaScript required. These pages come from an [Amiibo character database](https://demo-browser.lightpanda.io/amiibo/)  and include dynamic content that requires JavaScript to render properly. You can see the difference in the screenshots: with JavaScript disabled, you get placeholder text; with JavaScript enabled, you get the actual character data, image and following links.
**With JS**
**Without JS**
We ran both browsers on an [AWS EC2 m5.large instance](https://aws.amazon.com/ec2/instance-types/m5/)  and measured wall-clock time, peak memory usage, and CPU utilization across different levels of parallelism.
For Chrome, we used multiple tabs within a single browser instance, which is how most people run production automation. For Lightpanda, we ran multiple independent processes.
## What We Found[](#what-we-found)
We shared the same intuition as the people who raised these questions: we expected the gap to narrow. We thought network latency would dominate total time, making browser overhead less significant. We also thought Chrome’s mature memory management would perform better when juggling many tabs.
The results didn’t match our expectations.
Configuration
Duration
Memory Peak
CPU
Lightpanda 1 process
0:56.81
34.8M
5.6%
Lightpanda 2 processes
0:29.96
41.4M
11.5%
Lightpanda 5 processes
0:11.46
63.7M
34.6%
Lightpanda 10 processes
0:06.15
101.8M
70.6%
Lightpanda 25 processes
0:03.23
215.2M
185.2%
Lightpanda 100 processes
0:04.45
695.9M
254.3%
Chrome 1 tab
1:22.83
1.3G
124.9%
Chrome 2 tabs
0:53.11
1.3G
202.3%
Chrome 5 tabs
0:45.66
1.6G
237%
Chrome 10 tabs
0:45.62
1.7G
241.6%
Chrome 25 tabs
0:46.70
2.0G
254%
Chrome 100 tabs
1:09:37
4.2G
229%
The memory difference remained substantial. For 25 parallel tasks, Lightpanda used 123MB of memory versus Chrome’s 2GB (16x), and completed the crawl in 5 seconds versus 46 seconds (9x).
Chrome’s performance plateaued quickly. Adding more tabs beyond 5 didn’t meaningfully improve completion time, and at 100 tabs, performance degraded significantly. Lightpanda’s performance continued improving with additional processes until around 25.
## Why the Gap Persisted[](#why-the-gap-persisted)
We had assumed network time and using tabs would mask browser overhead, but this oversimplifies what Chrome does.
Chrome uses a multi-process architecture where each tab typically gets its own renderer process containing the V8 JavaScript engine and Blink rendering engine. [According to Chromium’s documentation](https://www.chromium.org/developers/design-documents/multi-process-architecture/) , this architecture enhances stability and security by isolating tabs, but it also means each process consumes [its own chunk of RAM](https://www.chromium.org/developers/memory-usage-backgrounder/) .
Lightpanda doesn’t maintain rendering pipelines or compositor threads because we don’t render. When a Lightpanda process is waiting on network I/O, it’s genuinely idle rather than maintaining infrastructure for visual output.
More importantly: Chrome has optimizations for background tabs. It can freeze JavaScript execution and reduce working set size for inactive tabs. But in an automation context where you’re actively loading and processing pages in parallel, these optimizations limit you.
By contrast, each Lightpanda process can run fully in parallel, so you get everything: isolation, speed, and low resource consumption.
## Methodology Notes[](#methodology-notes)
A few things to keep in mind when interpreting these results:
**Different parallelism models.** This benchmark compares Lightpanda’s multi-process approach against Chrome’s multi-tab approach. We’re comparing what people actually use in production, but they’re not identical architectures. Lightpanda doesn’t yet support multi-threading (running multiple tabs within a single process). We’re working on that feature and will update the benchmarks when it’s ready.
**Single test machine.** We ran on an AWS EC2 m5.large instance. Results could vary on different hardware configurations.
You can reproduce these results and examine the methodology in our demo repository: [github.com/lightpanda-io/demo](https://github.com/lightpanda-io/demo/blob/main/BENCHMARKS.md#crawler-benchmark) .
## What’s Next[](#whats-next)
We’ll continue publishing benchmarks as we add features. Multi-threading support will let us do a more direct comparison of tab-based parallelism. As we improve website compatibility, we’ll test against more diverse page sets.
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Posts Tagged with “memory”](https://lightpanda.io/blog/tags/memory) 
 _https://lightpanda.io/blog/tags/memory_

CTRL K
## [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.[Read More →](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Fri Feb 27 2026
## [From Local to Real World Benchmarks](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.[Read More →](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
Tue Jan 27 2026
## [Why We Built Lightpanda in Zig](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025

# [Posts Tagged with “crawling”](https://lightpanda.io/blog/tags/crawling) 
 _https://lightpanda.io/blog/tags/crawling_

 Posts Tagged with “crawling” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “crawling”
## [Lightpanda Now Supports robots.txt](/blog/posts/robotstxt-support)
Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.[Read More →](/blog/posts/robotstxt-support)
Fri Feb 20 2026
## [The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be](/blog/posts/the-real-cost-of-javascript)
Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.[Read More →](/blog/posts/the-real-cost-of-javascript)
Mon Nov 24 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “fundraising”](https://lightpanda.io/blog/tags/fundraising) 
 _https://lightpanda.io/blog/tags/fundraising_

 Posts Tagged with “fundraising” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “fundraising”
## [Lightpanda raises pre-seed to develop the first browser built for machines and AI](/blog/posts/lightpanda-raises-preseed)
We’re excited to share that Lightpanda has raised a pre-seed round to build the first browser designed from the ground up for machines.[Read More →](/blog/posts/lightpanda-raises-preseed)
Tue Jun 10 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “privacy”](https://lightpanda.io/blog/tags/privacy) 
 _https://lightpanda.io/blog/tags/privacy_

 Posts Tagged with “privacy” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “privacy”
## [Browser security in the age of AI agents](/blog/posts/browser-security-in-the-age-of-ai-agents)
AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.[Read More →](/blog/posts/browser-security-in-the-age-of-ai-agents)
Fri Aug 29 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Index](https://lightpanda.io/docs) 
 _https://lightpanda.io/docs_

## What is Lightpanda?[](#what-is-lightpanda)
Lightpanda is an AI-native web browser built from scratch for machines. Fast, scalable web automation with a minimal memory footprint.
Made for headless usage:
* Javascript execution
* Support of Web APIs
* Compatible with [Playwright](https://playwright.dev/) , [Puppeteer](https://pptr.dev/)  through CDP
Fast web automation for AI agents, LLM training, scraping and testing:
* Ultra-low memory footprint (10x less than Chrome)
* Exceptionally fast execution (10x faster than Chrome)
* Instant startup
ℹ️
When using Lightpanda, we recommend that you respect `robots.txt` files and avoid high frequency requesting websites. DDOS could happen fast for small infrastructures.
Lightpanda can follow `robots.txt` for you, just pass the `--obey_robots` option.
Next step: [Installation and setup](https://lightpanda.io/docs/quickstart/installation-and-setup)

# [Posts Tagged with “chrome”](https://lightpanda.io/blog/tags/chrome) 
 _https://lightpanda.io/blog/tags/chrome_

 Posts Tagged with “chrome” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “chrome”
## [From Local to Real World Benchmarks](/blog/posts/from-local-to-real-world-benchmarks)
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.[Read More →](/blog/posts/from-local-to-real-world-benchmarks)
Tue Jan 27 2026
## [What Is a True Headless Browser?](/blog/posts/what-is-a-true-headless-browser)
We explore the difference between a consumer browser in headless mode versus a true headless browser built for machines.[Read More →](/blog/posts/what-is-a-true-headless-browser)
Fri Nov 14 2025
## [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.[Read More →](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Fri Nov 07 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [MCP](https://lightpanda.io/docs/cloud-offer/tools/mcp) 
 _https://lightpanda.io/docs/cloud-offer/tools/mcp_

## Model Context Protocol
Use the [Model Context Protocol](https://modelcontextprotocol.io/)  (MCP) to easily control Lightpanda browser with your AI applications.
## Usage[](#usage)
The Lightpanda MCP service supports only [SSE](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports#http-with-sse)  transport.
Depending on your location, you can connect to the MCP using the url `wss://euwest.cloud.lightpanda.io/mcp/sse` or `wss//uswest.cloud.lightpanda.io/mcp/sse`.
### Authentication[](#authentication)
An authentication is required, you can either pass your token with the `token` query string parameter in the url, or use the `Authorization: Bearer` HTTP header.
Example with the query string.
 https://euwest.cloud.lightpanda.io/mcp/sse?token=TOKEN
Example with the Bearer HTTP header.
 https://euwest.cloud.lightpanda.io/mcp/sse
 Authorization: Bearer TOKEN
## Tools[](#tools)
* `search` Search a term on web search engine and get the search results.
* `goto` Navigate to a specified URL and load the page inmemory so it can be reused later for info extraction.
* `markdown` Get the page in memory content in markdown format.Run a goto before getting markdown.
* `links` Extract all links from the page in memory.Run a goto before getting links.
For more advanced use cases, you can use [CDP](https://lightpanda.io/docs/cloud-offer/tools/cdp) connection with [Playwright MCP](https://github.com/microsoft/playwright-mcp) .
[CDP](https://lightpanda.io/docs/cloud-offer/tools/cdp "CDP")

# [The headless browser](https://lightpanda.io/blog/rss.xml) 
 _https://lightpanda.io/blog/rss.xml_

<title>The headless browser</title>
<link>https://lightpanda.io</link>
<description>Latest blog posts</description>
<language>en-gb</language>
<item>
<title>New LP Domain Commands and Native MCP</title>
<description>The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.</description>
<link>https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp</link>
<pubDate>Wed, 11 Mar 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Native Markdown Output in Lightpanda</title>
<description>Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.</description>
<link>https://lightpanda.io/blog/posts/native-markdown-output</link>
<pubDate>Thu, 05 Mar 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>How We Built MultiClient into Lightpanda</title>
<description>Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.</description>
<link>https://lightpanda.io/blog/posts/how-we-built-multiclient</link>
<pubDate>Fri, 27 Feb 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Lightpanda Now Supports robots.txt</title>
<description>Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.</description>
<link>https://lightpanda.io/blog/posts/robotstxt-support</link>
<pubDate>Fri, 20 Feb 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Why Request Interception Matters</title>
<description>How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.</description>
<link>https://lightpanda.io/blog/posts/why-request-interception-matters</link>
<pubDate>Tue, 10 Feb 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>From Local to Real World Benchmarks</title>
<description>We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.</description>
<link>https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks</link>
<pubDate>Tue, 27 Jan 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Migrating our DOM to Zig</title>
<description>We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.</description>
<link>https://lightpanda.io/blog/posts/migrating-our-dom-to-zig</link>
<pubDate>Thu, 08 Jan 2026 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Why We Built Lightpanda in Zig</title>
<description>We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.</description>
<link>https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig</link>
<pubDate>Fri, 05 Dec 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>CDP Under the Hood: A Deep Dive</title>
<description>The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.</description>
<link>https://lightpanda.io/blog/posts/cdp-under-the-hood</link>
<pubDate>Fri, 28 Nov 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be</title>
<description>Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.</description>
<link>https://lightpanda.io/blog/posts/the-real-cost-of-javascript</link>
<pubDate>Mon, 24 Nov 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>What Is a True Headless Browser?</title>
<description>We explore the difference between a consumer browser in headless mode versus a true headless browser built for machines.</description>
<link>https://lightpanda.io/blog/posts/what-is-a-true-headless-browser</link>
<pubDate>Fri, 14 Nov 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>CDP vs Playwright vs Puppeteer: Is This the Wrong Question?</title>
<description>Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.</description>
<link>https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question</link>
<pubDate>Fri, 07 Nov 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Browser security in the age of AI agents</title>
<description>AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.</description>
<link>https://lightpanda.io/blog/posts/browser-security-in-the-age-of-ai-agents</link>
<pubDate>Fri, 29 Aug 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>Lightpanda browser now uses libcurl</title>
<description>We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl</description>
<link>https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl</link>
<pubDate>Wed, 16 Jul 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>
Lightpanda raises pre-seed
<br/>
to develop the first browser built for machines and AI
...
</title>
<description>We’re excited to share that Lightpanda has raised a pre-seed round to build the first browser designed from the ground up for machines.</description>
<link>https://lightpanda.io/blog/posts/lightpanda-raises-preseed</link>
<pubDate>Tue, 10 Jun 2025 00:00:00 GMT</pubDate>
...
</item>
<item>
<title>
Why build a new browser?
<br/>
From intuition to reality
...
</title>
<description>Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?</description>
<link>https://lightpanda.io/blog/posts/why-build-a-new-browser</link>
<pubDate>Wed, 28 May 2025 00:00:00 GMT</pubDate>
...
</item>
...

# [Lightpanda | The headless browser](https://lightpanda.io/blog) 
 _https://lightpanda.io/blog_

## Lightpanda's blog
[
## New LP Domain Commands and Native MCP
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.
Adrià ArrufatWednesday, March 11, 2026
](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)[
## Native Markdown Output in Lightpanda
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.
Adrià ArrufatThursday, March 5, 2026
](https://lightpanda.io/blog/posts/native-markdown-output)[
## How We Built MultiClient into Lightpanda
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.
Nikolay GovorovFriday, February 27, 2026
](https://lightpanda.io/blog/posts/how-we-built-multiclient)[
## Lightpanda Now Supports robots.txt
Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.
Muki KiboigoFriday, February 20, 2026
](https://lightpanda.io/blog/posts/robotstxt-support)[
## Why Request Interception Matters
How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.
Pierre TachoireTuesday, February 10, 2026
](https://lightpanda.io/blog/posts/why-request-interception-matters)[
## From Local to Real World Benchmarks
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.
Pierre TachoireTuesday, January 27, 2026
](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)[
## Migrating our DOM to Zig
We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.
Karl SeguinThursday, January 8, 2026
](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)[
## Why We Built Lightpanda in Zig
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.
Francis BouvierFriday, December 5, 2025
](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)[
## CDP Under the Hood: A Deep Dive
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.
Pierre TachoireFriday, November 28, 2025
](https://lightpanda.io/blog/posts/cdp-under-the-hood)[
## The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be
Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.
Katie BrownMonday, November 24, 2025
](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)[
## What Is a True Headless Browser?
We explore the difference between a consumer browser in headless mode versus a true headless browser built for machines.
Pierre TachoireFriday, November 14, 2025
](https://lightpanda.io/blog/posts/what-is-a-true-headless-browser)[
## CDP vs Playwright vs Puppeteer: Is This the Wrong Question?
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.
Pierre TachoireFriday, November 7, 2025
](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)[
## Browser security in the age of AI agents
AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.
Pierre TachoireFriday, August 29, 2025
](https://lightpanda.io/blog/posts/browser-security-in-the-age-of-ai-agents)[
## Lightpanda browser now uses libcurl
We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl
Pierre TachoireWednesday, July 16, 2025
](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)[
## Lightpanda raises pre-seed to develop the first browser built for machines and AI
We’re excited to share that Lightpanda has raised a pre-seed round to build the first browser designed from the ground up for machines.
Katie BrownTuesday, June 10, 2025
](https://lightpanda.io/blog/posts/lightpanda-raises-preseed)[
## Why build a new browser? From intuition to reality
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?
Francis BouvierWednesday, May 28, 2025
](https://lightpanda.io/blog/posts/why-build-a-new-browser)

# [Posts Tagged with “zig”](https://lightpanda.io/blog/tags/zig) 
 _https://lightpanda.io/blog/tags/zig_

CTRL K
## [Migrating our DOM to Zig](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.[Read More →](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
Thu Jan 08 2026
## [Why We Built Lightpanda in Zig](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025
## [Lightpanda browser now uses libcurl](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl[Read More →](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl)
Wed Jul 16 2025
## [Why build a new browser? From intuition to reality](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Three years ago when we started Lightpanda, we asked ourselves a seemingly simple question what would a browser look like if it were built specifically for automation?[Read More →](https://lightpanda.io/blog/posts/why-build-a-new-browser)
Wed May 28 2025

# [Posts Tagged with “playwright”](https://lightpanda.io/blog/tags/playwright) 
 _https://lightpanda.io/blog/tags/playwright_

 Posts Tagged with “playwright” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “playwright”
## [New LP Domain Commands and Native MCP](/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Native Markdown Output in Lightpanda](/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [CDP Under the Hood: A Deep Dive](/blog/posts/cdp-under-the-hood)
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.[Read More →](/blog/posts/cdp-under-the-hood)
Fri Nov 28 2025
## [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Web automation tools like Playwright and Puppeteer run on top of CDP. Understanding CDP helps developers choose the right level of abstraction.[Read More →](/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question)
Fri Nov 07 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Go to production with Lightpanda cloud - Documentation | Lightpanda](https://lightpanda.io/docs/quickstart/go-to-production-with-lightpanda-cloud) 
 _https://lightpanda.io/docs/quickstart/go-to-production-with-lightpanda-cloud_

Use [Lightpanda’s cloud offer](https://lightpanda.io/#cloud-offer)  to switch from a local browser to a remotely managed version.
Create a new account and an API token [here](https://console.lightpanda.io/signup) .
To connect, the script will use an environment variable named `LPD_TOKEN`. First export the variable with your token.
 export LPD_TOKEN="paste your token here"
Edit `index.js` to change the Puppeteer connection options:
### puppeteer
 const puppeteeropts = {
 browserWSEndpoint: 'wss://euwest.cloud.lightpanda.io/ws?token=' + process.env.LPD_TOKEN,
 };
ℹ️
Depending on your location, you can connect using the url `wss://euwest.cloud.lightpanda.io/ws` or `wss//uswest.cloud.lightpanda.io/ws`.
## Clean up local-only lines[](#clean-up-local-only-lines)
You no longer need to start a local browser process because you are using the cloud version. You can remove these parts of the script to simplify it:
 import { lightpanda } from '@lightpanda/browser';
 const lpdopts = {
 host: '127.0.0.1',
 port: 9222,
 };
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
## Final version[](#final-version)
Here is the final script using the cloud browser version:
### puppeteer
 'use strict'
 
 import puppeteer from 'puppeteer-core';
 
 const puppeteeropts = {
 browserWSEndpoint: 'wss://euwest.cloud.lightpanda.io/ws?token=' + process.env.LPD_TOKEN,
 };
 
 (async () => {
 // Connect Puppeteer to the browser.
 const browser = await puppeteer.connect(puppeteeropts);
 const context = await browser.createBrowserContext();
 const page = await context.newPage();
 
 // Go to hackernews home page.
 await page.goto("https://news.ycombinator.com/");
 
 // Find the search box at the bottom of the page and type the term lightpanda
 // to search.
 await page.type('input[name="q"]','lightpanda');
 // Press enter key to run the search.
 await page.keyboard.press('Enter');
 
 // Wait until the search results are loaded on the page, with a 5 seconds
 // timeout limit.
 await page.waitForFunction(() => {
 return document.querySelector('.Story_container') != null;
 }, {timeout: 5000});
 
 // Loop over search results to extract data.
 const res = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('.Story_container')).map(row => {
 return {
 // Extract the title.
 title: row.querySelector('.Story_title span').textContent,
 // Extract the URL.
 url: row.querySelector('.Story_title a').getAttribute('href'),
 // Extract the list of meta data.
 meta: Array.from(row.querySelectorAll('.Story_meta > span:not(.Story_separator, .Story_comment)')).map(row => {
 return row.textContent;
 }),
 }
 });
 });
 
 // Display the result.
 console.log(res);
 
 // Disconnect Puppeteer.
 await page.close();
 await context.close();
 await browser.disconnect();
 })();
## Interested in on premise deployment?[](#interested-in-on-premise-deployment)
The core Lightpanda browser will always remain open source, including JavaScript execution, CDP compatibility, proxy support, and request interception.
If you require on premise deployment, proprietary licensing, or enterprise features such as multi-context tabs and sandboxing, reach out to us at [hello@lightpanda.io](mailto:hello@lightpanda.io).
## Need help?[](#need-help)
Stuck or have questions about your use case? Book a 15-minute technical call with our team.
 
[3\. Extract data](https://lightpanda.io/docs/quickstart/build-your-first-extraction-script "3. Extract data")[Installation](https://lightpanda.io/docs/open-source/installation "Installation")

# [Privacy Policy - Lightpanda | The headless browser](https://lightpanda.io/privacy-policy) 
 _https://lightpanda.io/privacy-policy_

Last updated: March 18 2025
In this Privacy Policy, “Lightpanda” refers to Selecy SAS and its companies, all of which are subject to the same level of data protection. Lightpanda is the data controller as it processes your data on its own behalf. Lightpanda has designated the French data protection authority (CNIL) as the lead authority in terms of data protection.
**Our guiding principle**
Our guiding principle is to collect only what we need, and we will solely process this information to provide you with the service you signed up for.
We use a select number of trusted external service providers for certain service offerings. These service providers are carefully selected and meet high data protection, privacy, and security standards. We only share information with them that is required for the services offered, and we contractually bind them to keep any information we share with them confidential and to process personal data only according to our instructions.
**As a visitor of the [lightpanda.io](https://lightpanda.io/) website:**The privacy of our website visitors is important to us, so we do not track individual people. As a visitor to the [lightpanda.io](https://lightpanda.io/) website:
* \- No personal information is collected.
* \- No information such as cookies is stored in the browser.
* \- No information is sold to third parties.
* \- No information is shared with advertising companies.
* \- No information is mined and harvested for personal and behavioral trends.
* \- No information is monetized.
Lightpanda uses [Plausible Analytics](https://plausible.io/) to collect some anonymous usage data for statistical purposes. The goal is to track overall trends in our website traffic, not individual visitors. All data is aggregated, and no personal data is collected. You can view the data we collect in our live demo.
Data collected includes referral sources, top pages, visit duration, and information from the devices (device type, operating system, country, and browser) used during the visit. You can see full details in [Plausible's data policy](https://plausible.io/data-policy).
**As a open source browser user:****What we collect, what we use it for, and services we use:**
Lightpanda uses telemetry to track open source browser usage. Starting the browser and requesting a page trigger a telemetry event. We store data including the timestamp, the browser's version, the IP address, the browser's instance id, the CPU arch, the OS, the protocol and if a connection uses tls and a proxy. The browser's instance id is an UUID generated at the first start and stored in the app local directory in `lightpanda/iid` path. The app local directory depends on the user's OS.
**What we don't collect**
The telemetry doesn't collect sensitive data, including but not limited to: environment variables, file paths, contents of files, logs, URL, cookies, headers, page content.
Lightpanda uses an internal database to store the data received by the telemetry.
Lightpanda uses [Posthog](https://posthog.com/) to store the data received by the telemetry.
**Disable telemetry:**
You can disable telemetry by setting the env var `LIGHTPANDA_DISABLE_TELEMETRY=true`.
**As a cloud offer user:****What we collect, what we use it for, and services we use:**
Lightpanda uses [Slack](https://www.slack.com/) to notify email subscriptions. This notification allow us to create an new account and send you your connection token.
Lightpanda uses an internal database to store your email for the cloud offer. You need to provide us with your email address if you want to subscribe to the Lightpanda cloud offer. This allows us to send you your connection token and maintain your account.
Lightpanda uses [Posthog](https://posthog.com/) to track the Lightpanda cloud usages. We send them your IP address and an unique Lightpanda's token identifier each time you create a new browser session.
**Retention of data:**
We will retain your information as long as your subscription to the cloud offer is active. We will also retain and use this information as necessary for the purposes set out in this policy and to the extent necessary to comply with our legal obligations, resolve disputes, enforce our agreements, and protect Lightpanda's legal rights. You can choose to unsubscribe from the Lightpanda cloud offer at any time. All your data will be permanently deleted immediately when you unsubscribe.
**As a mailing list user:****What we collect, what we use it for, and services we use:**
Lightpanda uses [Mailerlite](https://www.mailerlite.com/) to store email subscriptions and send emails. You can see full details in [Mailerlite's data policy](https://www.mailerlite.com/legal/privacy-policy) . An email address is required to subscribe to the mailing list. You need to provide us with your email address if you want to subscribe to the Lightpanda mailing list. This allows us to send you product updates and other essential information.
**Email opening and click tracking:**
Mailerlite may include single-pixel gifs (web beacons) in emails we send, which allow us to collect information about when you open the email and your IP address, browser or email client type, and other similar details. We use the data from those web beacons to create reports about our email campaign performance and pages visited.
**Retention of data:**
We will retain your information as long as your subscription to the mailing list is active and as necessary to provide you with the information. We will also retain and use this information as necessary for the purposes set out in this policy and to the extent necessary to comply with our legal obligations, resolve disputes, enforce our agreements, and protect Lightpanda's legal rights. You can choose to unsubscribe from the Lightpanda mailing list at any time. All your data will be permanently deleted immediately when you unsubscribe.
**Changes and questions:**
We may update this policy as needed to comply with relevant regulations and reflect any new practices. Whenever we make a significant change to our policies, we will also announce them on our company blog or social media profiles. Contact us at [hello@lightpanda.io](mailto:hello@lightpanda.io) if you have any questions, comments, or concerns about this privacy policy, your data, or your rights with respect to your information.
**Contact Information:**
If you have any questions or comments about this Privacy Policy, the ways in which we collect and use your personal data or your choices and rights regarding such collection and use, please do not hesitate to contact us at: 
[hello@lightpanda.io](mailto:hello@lightpanda.io)
Selecy SAS 
8 rue du faubourg Poissonnière 
75010 Paris France

# [Usage](https://lightpanda.io/docs/open-source/usage) 
 _https://lightpanda.io/docs/open-source/usage_

Use `./lightpanda help` for all options.
## Dump an URL[](#dump-an-url)
 ./lightpanda fetch --obey_robots --dump html https://demo-browser.lightpanda.io/campfire-commerce/
 INFO http : navigate . . . . . . . . . . . . . . . . . . . . [+0ms]
 url = https://demo-browser.lightpanda.io/campfire-commerce/
 method = GET
 reason = address_bar
 body = false
 
 INFO browser : executing script . . . . . . . . . . . . . . [+196ms]
 src = https://demo-browser.lightpanda.io/campfire-commerce/script.js
 kind = javascript
 cacheable = true
 
 INFO http : request complete . . . . . . . . . . . . . . . . [+223ms]
 source = xhr
 url = https://demo-browser.lightpanda.io/campfire-commerce/json/product.json
 status = 200
 
 INFO http : request complete . . . . . . . . . . . . . . . . [+234ms]
 source = xhr
 url = https://demo-browser.lightpanda.io/campfire-commerce/json/reviews.json
 status = 200
 <!DOCTYPE html>
### Options[](#options)
The fetch command accepts options:
* `--dump html` Dumps document to stdout in HTML. You can use also `--dump markdown` to get a Markdown version.
* `--with_base` Add a `<base>` tag in dump
* `--log_level` change the log level, default is `info`. `--log_level debug`.
* `--http_proxy` The HTTP proxy to use for all HTTP requests. A username:password can be included for basic authentication. `--http_proxy http://user:password@127.0.0.1:3000`.
* `--http_timeout` The maximum time, in milliseconds, the transfer is allowedto complete. 0 means it never times out. Defaults to `10000`.
* `--obey_robots` Fetches and obeys the robots.txt (if available) of the web pages we make requests towards.
See also [how to configure proxy](https://lightpanda.io/docs/open-source/guides/configure-a-proxy).
## Start a CDP server[](#start-a-cdp-server)
To control Lightpanda with [Chrome Devtool Protocol](https://chromedevtools.github.io/devtools-protocol/)  (CDP) clients like [Playwright](https://playwright.dev/)  or [Puppeteer](https://pptr.dev/) , you need to start the browser as a CDP server.
 ./lightpanda serve --obey_robots --host 127.0.0.1 --port 9222
 INFO app : server running . . . . . . . . . . . . . . . . . [+0ms]
 address = 127.0.0.1:9222
### Options[](#options-1)
The fetch command accepts options:
* `--host` Host of the CDP server, default `127.0.0.1`.
* `--port` Port of the CDP server, default `9222`.
* `--timeout` Inactivity timeout in seconds before disconnecting clients. Default `10` seconds.
* `--log_level` change the log level, default is `info`. `--log_level debug`.
* `--http_proxy` The HTTP proxy to use for all HTTP requests. A username:password can be included for basic authentication. `--http_proxy http://user:password@127.0.0.1:3000`.
* `--http_timeout` The maximum time, in milliseconds, the transfer is allowedto complete. 0 means it never times out. Defaults to `10000`.
* `--obey_robots` Fetches and obeys the robots.txt (if available) of the web pages we make requests towards.
See also [how to configure proxy](https://lightpanda.io/docs/open-source/guides/configure-a-proxy).
### Connect with Puppeteer[](#connect-with-puppeteer)
Once the CDP server started, you can run a [Puppeteer](https://playwright.dev/)  script by configuring the `browserWSEndpoint`.
 'use strict'
 
 import puppeteer from 'puppeteer-core'
 
 // use browserWSEndpoint to pass the Lightpanda's CDP server address.
 const browser = await puppeteer.connect({
 browserWSEndpoint: "ws://127.0.0.1:9222",
 })
 
 // The rest of your script remains the same.
 const context = await browser.createBrowserContext()
 const page = await context.newPage()
 
 // Dump all the links from the page.
 await page.goto('https://wikipedia.com/')
 
 const links = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('a')).map(row => {
 return row.getAttribute('href')
 })
 })
 
 console.log(links)
 
 await page.close()
 await context.close()
 await browser.disconnect()
### Connect with Playwright[](#connect-with-playwright)
Try Lightpanda with [Playwright](https://playwright.dev/)  by using `chromium.connectOverCDP` to connect.
 import { chromium } from 'playwright-core';
 
 // use connectOverCDP to pass the Lightpanda's CDP server address.
 const browser = await chromium.connectOverCDP('ws://127.0.0.1:9222');
 
 // The rest of your script remains the same.
 const context = await browser.newContext({});
 const page = await context.newPage();
 
 await page.goto('https://wikipedia.com/');
 
 const title = await page.locator('h1').textContent();
 console.log(title);
 
 await page.close();
 await context.close();
 await browser.close();
### Connect with Chromedp[](#connect-with-chromedp)
Use Lightpanda with [Chromedp](https://github.com/chromedp/chromedp) , a Golang client for CDP servers.
 package main
 
 import (
 "context"
 "flag"
 "log"
 
 "github.com/chromedp/chromedp"
 )
 
 func main() {
 ctx, cancel = chromedp.NewRemoteAllocator(ctx,
 "ws://127.0.0.1:9222", chromedp.NoModifyURL,
 )
 defer cancel()
 
 ctx, cancel := chromedp.NewContext(allocatorContext)
 defer cancel()
 
 var title string
 if err := chromedp.Run(ctx,
 chromedp.Navigate("https://wikipedia.com/"),
 chromedp.Title(&title),
 ); err != nil {
 log.Fatalf("Failed getting page's title: %v", err)
 }
 
 log.Println("Got title of:", title)
 }
[Installation](https://lightpanda.io/docs/open-source/installation "Installation")[Build from sources](https://lightpanda.io/docs/open-source/guides/build-from-sources "Build from sources")

# [Systems requirements](https://lightpanda.io/docs/open-source/systems-requirements) 
 _https://lightpanda.io/docs/open-source/systems-requirements_

[Question? Send us feedback](https://github.com/lightpanda-io/docs/issues/new?title=Feedback%20for%20%E2%80%9CSystems%20requirements%E2%80%9D&labels=feedback) [Edit this page](https://github.com/lightpanda-io/docs/blob/main/src/content/open-source/systems-requirements.mdx) 
Version: v0.2.5
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)
[Open source edition](https://lightpanda.io/docs/open-source/installation "Open source edition")
Systems requirements
* Debian 12, Ubuntu 22.04, Ubuntu 24.04, on x86-64 and arm64 architecture.
* macOS 13 Ventura, or later.
* Windows 10+, Windows Server 2016+ or Windows Subsystem for Linux (WSL).
[Use Stagehand](https://lightpanda.io/docs/open-source/guides/use-stagehand "Use Stagehand")[Getting started](https://lightpanda.io/docs/cloud-offer/getting-started "Getting started")

# [Posts Tagged with “C++”](https://lightpanda.io/blog/tags/C%2B%2B) 
 _https://lightpanda.io/blog/tags/C%2B%2B_

 Posts Tagged with “C++” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “C++”
## [Why We Built Lightpanda in Zig](/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Lightpanda | The headless browser](https://lightpanda.io) 
 _https://lightpanda.io_

## The first browserfor machines, not humans
## 
10x faster. 10x less memory. Instant startup.
### Web automation is being held back
Web browsers lack the speed, durability, and security for AI workloads.
IconNoCloud
### Chrome wasn’t built for the cloud
* Running Chrome in the cloud is expensive and slow.
* You’re paying for decades of code built for people, not systems.
IconSlowBrowser
### Browsers are slow and brittle
* Real-time automation shouldn't wait for browsers.
* Chrome takes seconds to start, which multiply across every process.
IconSharedState
### Shared state is a security risk
* Automation needs isolated environments.
* Traditional browsers carry persistent state, cookies & sessions across tasks.
## AI agents
### deserve a 100x better web browser
### Built from scratch
Not reliant on existing browsers.
### Created with Zig
Developed in a low-level system programming language designed for performance and efficiency.
### Focused and opinionated
Purpose-built for headless operation, without rendering overhead.
Puppeteer requesting 100 pages from a local website on a AWS EC2 m5.large instance. [See benchmark details](https://github.com/lightpanda-io/demo)
IconScrape
### Crawl at scale
* Handle resource-intensive web scraping
* Minimal CPU and memory footprint
IconBuild
### Build AI agents
* Empower AI agents with web capabilities
* Instant startup and fully embeddable
IconAutomate
### Automate any website
* Transform any website into a programmatic interface
* JavaScript execution and web APIs
## Developers are talking about Lightpanda
## Cloud Offer
### Engineered for your workflows
Scale effortlessly with your existing tools (Puppeteer, Playwright)
### Lightpanda innovation, 
Chrome reliability
Choose from Chrome or Lightpanda's browser to ensure all use cases are covered
`import puppeteer from "puppeteer" // Replace puppeteer.launch with puppeteer.connect. const browser = await puppeteer.connect({ browserWSEndpoint: "wss://euwest.cloud.lightpanda.io/ws?token=YOUR_TOKEN", }) // The rest of your script remains the same. const page = await browser.newPage()`
## About Lightpanda
Building a web browser from scratch is a monumental challenge, one that few have attempted.
We took it on because automation and AI demand a fresh foundation, not wrappers on a legacy tech stack.
At our previous company, we scraped millions of web pages a day, and spent years navigating the pain of scaling scraping infrastructure with Chrome.
We knew the only real solution was to start over.
Lightpanda is here to change the game. We want to enable developers and businesses to do more with less.
We're building something ambitious and unconventional.
[Join us.](https://lightpanda.io/jobs)
## Ambitious. Unconventional.
### And just getting started
[IconGithub](https://github.com/lightpanda-io/browser)

# [Installation and setup - Documentation | Lightpanda](https://lightpanda.io/docs/quickstart/installation-and-setup) 
 _https://lightpanda.io/docs/quickstart/installation-and-setup_

## Quickstart
In this Quickstart, you’ll set up your first project with [Lightpanda browser](https://lightpanda.io/)  and run it locally in under 10 minutes. By the end of this guide, you’ll have:
* A working [Node.js](https://nodejs.org/)  project configured with Lightpanda
* A browser instance that starts and stops programmatically
* The foundation for running automated scripts using either [Puppeteer](https://pptr.dev/)  or [Playwright](https://playwright.dev/)  to control the browser
1. [Installation and setup](https://lightpanda.io/docs/quickstart/installation-and-setup)
2. [Your first test](https://lightpanda.io/docs/quickstart/your-first-test)
3. [Extract data](https://lightpanda.io/docs/quickstart/build-your-first-extraction-script)
4. [Go to production with Lightpanda cloud](https://lightpanda.io/docs/quickstart/go-to-production-with-lightpanda-cloud)
## Prerequisites[](#prerequisites)
You’ll need [Node.js](https://nodejs.org/en/download)  installed on your computer.
## Initialize the Node.js project[](#initialize-the-nodejs-project)
Create a `hn-scraper` directory and initialize a new Node.js project.
 mkdir hn-scraper && \
 cd hn-scraper && \
 npm init
You can accept all the default values in the npm init prompts. When done, your directory should look like this:
* * package.json
## Install Lightpanda dependency[](#install-lightpanda-dependency)
Install Lightpanda by using the [official npm package](https://www.npmjs.com/package/@lightpanda/browser) .
### npm
 npm install --save @lightpanda/browser
Create an `index.js` file with the following content:
 'use strict'
 
 import { lightpanda } from '@lightpanda/browser';
 
 const lpdopts = {
 host: '127.0.0.1',
 port: 9222,
 };
 
 (async () => {
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 
 // Do your magic ✨
 
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
 })();
Run your script to start and stop a Lightpanda browser.
Starting and stopping the browser is almost instant.
 $ node index.js
 🐼 Running Lightpanda's CDP server... { pid: 4084512 }
### Step 2: [Your first test](https://lightpanda.io/docs/quickstart/your-first-test)[](#step-2--your-first-test)
[Introduction](https://lightpanda.io/docs "Introduction")[2\. Your first test](https://lightpanda.io/docs/quickstart/your-first-test "2. Your first test")

# [Why Request Interception Matters](https://lightpanda.io/blog/posts/why-request-interception-matters) 
 _https://lightpanda.io/blog/posts/why-request-interception-matters_

### Pierre Tachoire
#### Cofounder & CTO
Tuesday, February 10, 2026
## TL;DR[](#tldr)
Request interception lets clients pause HTTP requests before they’re sent, modify them, or replace responses entirely. The real challenge isn’t the concept, it’s managing request ordering with asynchronous CDP message exchanges. You’re building a state machine that coordinates between your HTTP client and CDP WebSocket, ensuring requests don’t hang and race conditions don’t corrupt page state.
## Why Request Interception Matters[](#why-request-interception-matters)
When you’re automating the web at scale, you need control over network traffic. Here’s what users actually do with request interception:
* **Proxy authentication.** Many automation setups route traffic through proxies that require auth headers.
* **Response caching.** If you’re crawling thousands of pages from the same site, you don’t want to download the same JavaScript bundle thousands of times. Intercept the request, check your cache, return the cached response.
* **Request blocking.** Block analytics scripts (Google Analytics, Segment, Mixpanel), ad networks (DoubleClick, Facebook Pixel), or tracking pixels.
* **Response mocking.** For testing, inject specific API responses without hitting the real backend. Mock authentication endpoints to test logged-in states, inject error responses to test error handling, or simulate slow responses to test timeout behavior.
* **Logging and debugging.** See exactly what requests your page makes, in what order, with what headers. Detect unexpected third-party calls, or debug why a specific API request is failing.
This is one of the most-used features in tools like Puppeteer and Playwright. If you’re building a browser for automation, you need to get this right.
## How CDP Request Interception Works[](#how-cdp-request-interception-works)
Chrome DevTools Protocol (CDP) is how clients control headless browsers. It’s the standard that Puppeteer, Playwright, and most automation tools speak. For request interception, the flow looks like this:
1. Client sends to turn on interception
2. Before each request, browser sends event with a unique request ID
3. Browser waits for client to respond
4. Client decides: continue, modify, fail, or fulfill the request
5. Client sends the appropriate command (, , or )
6. Browser proceeds accordingly
Here’s what this looks like from the client side in Puppeteer:
Simple API. But underneath, there’s important coordination happening between the browser and client over WebSocket.
## The Implementation Challenge[](#the-implementation-challenge)
The naive approach doesn’t work. You can’t just pause your HTTP client and block until the WebSocket message comes back. That would block your entire event loop.
Here’s what we actually built:
The key insight is that you need an async queue. When a request comes in:
1. Register a callback with the HTTP client.
2. On new request, the [HTTP Client](https://github.com/lightpanda-io/browser/blob/main/src/http/Client.zig)  dispatches an internal event to eventually wait for interception.
2. [requestIntercept](https://github.com/lightpanda-io/browser/blob/main/src/cdp/domains/fetch.zig)  puts the request info in a pending queue.
3. It sends a message to the CDP client.
4. Return control to the event loop.
5. When the [client responds](https://github.com/lightpanda-io/browser/blob/main/src/cdp/domains/fetch.zig) , look up the request by ID.
6. Execute the appropriate action: update and process, fulfill or abort the request.
The tricky part is making sure nothing leaks. If a client disconnects while requests are pending, you need to clean up. If a page navigates away, pending requests for that page need to be aborted. If the same request ID is somehow reused (it shouldn’t be, but you must do defensive programming), you need to handle it carefully.
We use a counter in our HTTP client to track the pending intercepted requests. Then [we use it](https://github.com/lightpanda-io/browser/blob/main/src/browser/Page.zig)  to detect network idle events.
At CDP level, we store all pending requests in a hashmap. We can then abort these requests [on client disconnection](https://github.com/lightpanda-io/browser/blob/main/src/cdp/cdp.zig) .
## Performance Considerations[](#performance-considerations)
Request interception adds latency. Every intercepted request requires a round-trip to the CDP client before it can proceed.
If you’re doing heavy interception, the latency is often acceptable because you’re saving more time than you’re spending. Blocking 50 analytics and ad requests that would each take 100ms is potentially worth the few milliseconds of interception overhead.
## Try Lightpanda[](#try-lightpanda)
If you want to try Lightpanda, the [quickstart guide](https://docs.lightpanda.io/docs/quickstart)  will get you running in a few minutes. We [welcome feedback and issues](mailto:hello@lightpanda.io). We respond to all emails and would love to hear about your use cases.
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Build your first data extraction script - Documentation | Lightpanda](https://lightpanda.io/docs/quickstart/build-your-first-extraction-script) 
 _https://lightpanda.io/docs/quickstart/build-your-first-extraction-script_

## 3\. Extract data
We will now use the browser to run a search on the [HackerNews website](https://news.ycombinator.com/) . We need Lightpanda here because the website uses XHR requests to display search results. We will also run query selectors directly in the browser to extract and structure the data.
## Navigate and search[](#navigate-and-search)
Similar to the Wikipedia example, edit `index.js` to navigate to HackerNews:
### puppeteer
 await page.goto("https://news.ycombinator.com/");
Type the term lightpanda in the search input at the bottom of the page and press the Enter key to submit the search:
### puppeteer
 await page.type('input[name="q"]','lightpanda');
 await page.keyboard.press('Enter');
Wait for the search results to be displayed, with a timeout limit of 5 seconds:
### puppeteer
 await page.waitForFunction(() => {
 return document.querySelector('.Story_container') != null;
 }, {timeout: 5000});
## Extract the data[](#extract-the-data)
We will loop over the search results to extract the title, the URL, and a list of metadata including the author, the number of points, and comments:
### puppeteer
 // Loop over search results to extract data.
 const res = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('.Story_container')).map(row => {
 return {
 // Extract the title.
 title: row.querySelector('.Story_title span').textContent,
 // Extract the URL.
 url: row.querySelector('.Story_title a').getAttribute('href'),
 // Extract the list of meta data.
 meta: Array.from(row.querySelectorAll('.Story_meta > span:not(.Story_separator, .Story_comment)')).map(row => {
 return row.textContent;
 }),
 }
 });
 });
## The final script[](#the-final-script)
Here is the full version of index.js updated to run the search and extract results:
### puppeteer
 'use strict'
 
 import { lightpanda } from '@lightpanda/browser';
 import puppeteer from 'puppeteer-core';
 
 const lpdopts = {
 host: '127.0.0.1',
 port: 9222,
 };
 
 const puppeteeropts = {
 browserWSEndpoint: 'ws://' + lpdopts.host + ':' + lpdopts.port,
 };
 
 (async () => {
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 
 // Connect Puppeteer to the browser.
 const browser = await puppeteer.connect(puppeteeropts);
 const context = await browser.createBrowserContext();
 const page = await context.newPage();
 
 // Go to hackernews home page.
 await page.goto("https://news.ycombinator.com/");
 
 // Find the search box at the bottom of the page and type the term lightpanda
 // to search.
 await page.type('input[name="q"]','lightpanda');
 // Press enter key to run the search.
 await page.keyboard.press('Enter');
 
 // Wait until the search results are loaded on the page, with a 5 seconds
 // timeout limit.
 await page.waitForFunction(() => {
 return document.querySelector('.Story_container') != null;
 }, {timeout: 5000});
 
 // Loop over search results to extract data.
 const res = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('.Story_container')).map(row => {
 return {
 // Extract the title.
 title: row.querySelector('.Story_title span').textContent,
 // Extract the URL.
 url: row.querySelector('.Story_title a').getAttribute('href'),
 // Extract the list of meta data.
 meta: Array.from(row.querySelectorAll('.Story_meta > span:not(.Story_separator, .Story_comment)')).map(row => {
 return row.textContent;
 }),
 }
 });
 });
 
 // Display the result.
 console.log(res);
 
 // Disconnect Puppeteer.
 await page.close();
 await context.close();
 await browser.disconnect();
 
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
 })();
## Run the script[](#run-the-script)
You can run it to see the result immediately:
 $ node index.js
 🐼 Running Lightpanda's CDP server… { pid: 598201 }
 [
 {
 title: 'Show HN: Lightpanda, an open-source headless browser in Zig',
 url: 'https://news.ycombinator.com/item?id=42817439',
 meta: [ '319 points', 'fbouvier', '9 months ago', '137 comments' ]
 },
 {
 title: 'Lightpanda: Headless browser designed for AI and automation',
 url: 'https://news.ycombinator.com/item?id=42812859',
 meta: [ '154 points', 'tosh', '9 months ago', '1 comments' ]
 },
 {
 title: 'Show HN: Lightpanda, an open-source headless browser in Zig',
 url: 'https://news.ycombinator.com/item?id=42430629',
 meta: [ '7 points', 'fbouvier', '10 months ago', '0 comments' ]
 },
 {
 title: 'Lightpanda: Fast headless browser from scratch in Zig for AI and automation',
 url: 'https://news.ycombinator.com/item?id=44900394',
 meta: [ '5 points', 'lioeters', '2 months ago', '0 comments' ]
 },
 {
 title: 'Lightpanda – The Headless Browser',
 url: 'https://news.ycombinator.com/item?id=42745150',
 meta: [ '4 points', 'vladkens', '9 months ago', '2 comments' ]
 },
 {
 title: 'Lightpanda raises pre-seed to develop first browser built for machines and AI',
 url: 'https://news.ycombinator.com/item?id=44263271',
 meta: [ '1 points', 'cpeterso', '4 months ago', '0 comments' ]
 }
 ]
### Step 4: [Go to production](https://lightpanda.io/docs/quickstart/go-to-production-with-lightpanda-cloud)[](#step-4-go-to-production)

# [Why We Built Lightpanda in Zig](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig) 
 _https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig_

Because We're Not Smart Enough for C++ or Rust
### Francis Bouvier
#### Cofounder & CEO
## TL;DR[](#tldr)
To be honest, when I began working on Lightpanda, I chose Zig because I’m not smart enough to build a big project in C++ or Rust.
I like simple languages. I like Zig for the same reasons I like Go, C, and the KISS principle. Not just because I believe in this philosophy, but because I’m not capable of handling complicated abstractions at scale.
Before Lightpanda, I was doing a lot of Go. But building a web browser from scratch requires a low-level systems programming language to ensure great performance, so Go wasn’t an option. And for a project like this, I wanted more safety and modern tooling than C.
## Why We Built Lightpanda in Zig[](#why-we-built-lightpanda-in-zig)
Our requirements were performance, simplicity, and modern tooling. Zig seemed like the perfect balance: simpler than C++ and Rust, top-tier performance, and better tooling and safety than C.
As we built the first iterations of the browser and dug deeper into the language, we came to appreciate features where Zig particularly shines: comptime metaprogramming, explicit memory allocators, and best-in-class C interoperability. Not to mention the ongoing work on compilation times.
Of course it’s a big bet. Zig is a relatively new language with a small ecosystem. It’s pre-1.0 with regular breaking changes. But we’re very bullish on this language, and we’re not the only ones: [Ghostty](https://ghostty.org/) , [Bun](https://bun.com/) , [TigerBeetle](https://tigerbeetle.com/) , and [ZML](https://zml.ai/)  are all building with Zig. And with [Anthropic’s recent acquisition of Bun](https://bun.com/blog/bun-joins-anthropic) , big tech is taking notice.
Here’s what we’ve learned.
## What Lightpanda Needs from a Language[](#what-lightpanda-needs-from-a-language)
Before diving into specifics, let’s talk about what building a browser for web automation requires.
First, we needed a JavaScript engine. Without one, a browser only sees static HTML: no client-side rendering and no dynamic content. We chose V8, Chrome’s JavaScript engine, because it’s state of the art, widely used ([Node.js](https://nodejs.org/en) , [Deno](https://github.com/denoland/deno) ), and relatively easy to embed.
V8 is written in C++, and doesn’t have a C API, which means any language integrating with it must handle C++ boundaries. Zig doesn’t interoperate directly with C++, but it has first-class C interop, and C remains the lingua franca of systems programming. We use C headers generated primarily from [rusty\_v8](https://github.com/denoland/rusty_v8) , part of the [Deno project](https://github.com/denoland/deno) , to bridge between V8’s C++ API and our Zig code.
Beyond integration, performance and memory control were essential. When you’re crawling thousands of pages or running automation at scale, every millisecond counts. We also needed precise control over short-lived allocations like DOM trees, JavaScript objects, and parsing buffers. Zig’s explicit allocator model fits that need perfectly.
## Why Not C++?[](#why-not-c)
C++ was the obvious option: it powers virtually every major browser engine. But here’s what gave us pause.
* **Four decades of features**: C++ has accumulated enormous complexity over the years. There are multiple ways to do almost everything: template metaprogramming, multiple inheritance patterns, various initialization syntaxes. We wanted a language with one clear way to do things.
* **Memory management**: Control comes with constant vigilance. Use-after-free bugs, memory leaks, and dangling pointers are real risks. Smart pointers help, but they add complexity and runtime overhead. Zig’s approach of passing allocators explicitly makes memory management clearer and enables patterns like arenas more naturally.
* **Build systems**: Anyone who’s fought with CMake or dealt with header file dependencies knows this pain. For a small team trying to move quickly, we didn’t want to waste time debugging build configuration issues.
We’re not saying C++ is bad. It powers incredible software. But for a small team starting from scratch, we wanted something simpler.
## Why not Rust?[](#why-not-rust)
Many people ask this next. It’s a fair challenge. Rust is a more mature language than Zig, offers memory safety guarantees, has excellent tooling, and a growing ecosystem.
Rust would have been a viable choice. But for Lightpanda’s specific needs (and honestly, for our team’s experience level) it introduced friction we didn’t want.
### The Unsafe Rust Problem[](#the-unsafe-rust-problem)
When you need to do things the borrow checker doesn’t like, you end up writing unsafe Rust, which is surprisingly hard. [Zack](https://zackoverflow.dev/)  from [Bun](https://bun.com/)  explores this in depth in his article [When Zig is safer and faster than Rust](https://zackoverflow.dev/writing/unsafe-rust-vs-zig/) .
Browser engines and garbage-collected runtimes are classic examples of code that fights the borrow checker. You’re constantly juggling different memory regions: per-page arenas, shared caches, temporary buffers, objects with complex interdependencies. These patterns don’t map cleanly to Rust’s ownership model. You end up either paying performance costs (using indices instead of pointers, unnecessary clones) or diving into unsafe code where raw pointer ergonomics are poor and Miri becomes your constant companion.
Zig takes a different approach. Rather than trying to enforce safety through the type system and then providing an escape hatch, Zig is designed for scenarios where you’re doing memory-unsafe things. It gives you tools to make that experience better: non-null pointers by default, the GeneralPurposeAllocator that catches use-after-free bugs in debug mode, and pointer types with good ergonomics.
## Why Zig Works for Lightpanda[](#why-zig-works-for-lightpanda)
Zig sits in an interesting space. It’s a simple language that’s easy to learn, where everything is explicit: no hidden control flow, no hidden allocations.
### Explicit Memory Management with Allocators[](#explicit-memory-management-with-allocators)
Zig makes you choose how memory is managed through allocators. Every allocation requires you to specify which allocator to use. This might sound tedious at first, but it gives you precise control.
Here’s what this looks like in practice, using an arena allocator:
This pattern matches browser workloads perfectly. Each page load gets its own arena. When the page is done, we throw away the entire memory chunk. No tracking individual allocations, no reference counting overhead, no garbage collection pauses. (Though we’re learning that single pages can grow large in memory, so we’re also exploring mid-lifecycle cleanup strategies). And you can chain arenas, to create short-lived objects inside a page lifecycle.
### Compile-Time Metaprogramming[](#compile-time-metaprogramming)
Zig’s comptime feature lets you write code that runs during compilation. We use this extensively to reduce boilerplate when bridging Zig and JavaScript.
When integrating V8, you need to expose native types to JavaScript. In most languages, this requires glue code for each type. To generate this glue you need some code generation, usually through Macros (Rust, C, C++). Macros are a completely different language, which has a lot of downsides. Zig’s comptime lets us automate this:
The registerType function uses comptime reflection to:
* Find all public methods on Point
* Generate JavaScript wrapper functions
* Create property getters/setters for x and y
* Handle type conversions automatically
This eliminates manual binding code and makes adding new types simple by using the same language at compile time and runtime.
### C Interop That Just Works[](#c-interop-that-just-works)
Zig’s C interop is a first-class feature: you can directly import C header files and call C functions without wrapper libraries.
For example, we use cURL as our HTTP library. We can just import libcurl C headers in Zig and use the C functions directly:
It feels as simple as using C, except you are programming in Zig.
And with the build system it’s also very simple to add the C sources to build everything together (your zig code and the C libraries):
This simplicity of importing C mitigates the fact that the Zig ecosystem is still small, as you can use all the existing C libraries.
### The Build System Advantage[](#the-build-system-advantage)
Zig includes its own build system written in Zig itself. This might sound unremarkable, but compared to CMake, it’s refreshingly straightforward. Adding dependencies, configuring compilation flags, and managing cross-compilation all happen in one place with clear semantics. Runtime, comptime, build system: everything is in Zig, which makes things easier.
Cross-compilation in particular is usually a difficult topic, but it’s very easy with Zig. Some projects like [Uber](https://thamizhelango.medium.com/why-uber-chose-zig-as-their-c-c-toolchain-a-technical-deep-dive-771584e57c5b)  use Zig mainly as a build system and toolchain.
### Compile times matter[](#compile-times-matter)
Zig compiles fast. Our full rebuild takes under a minute. Not as fast as Go or an interpreted language, but enough to have a feedback loop that makes development feel responsive. In that regard, Zig is considerably faster than Rust or C++.
This is a strong focus of the Zig team. They are also a small team and they need fast compilation for the development of the language, as Zig is written in Zig (self-hosted). For that purpose, they are developing native compiler backends (i.e. not using LLVM), which is very ambitious and yet successful: it’s already the default backend for x86 in debug mode, with a significant improvement in build times ([3.5x faster for the Zig project itself](https://ziglang.org/devlog/2025/#2025-06-08) ). And [incremental compilation](https://ziglang.org/download/0.15.1/release-notes.html#Incremental-Compilation)  is on its way.
## What We’ve Learned[](#what-weve-learned)
After months of building Lightpanda in Zig, here’s what stands out.
* **The learning curve is manageable.** Zig’s simplicity means you can understand the entire language in a few weeks. Compared to Rust or C++, this makes a real difference.
* **The allocator model pays off.** Being able to create arena allocators per page load, per request, or per task gives us fine-grained memory control without tracking individual allocations.
* **The community** is small but helpful. Zig is still growing. The Discord community and [ziggit.dev](https://ziggit.dev/)  are active, and the language is simple enough that you can often figure things out by reading the standard library source.
## Conclusion[](#conclusion)
Lightpanda wouldn’t exist without the work of the Zig Foundation and the community behind it. Zig has made it possible to build something as complex as a browser with a small team and a clear mental model, without sacrificing performance.
* If you’re curious about Zig’s design philosophy or want to see how its compiler and allocator model work, the [official documentation](https://ziglang.org/documentation/)  is the best place to start.
* You can also explore the [Lightpanda source code](https://github.com/lightpanda-io/browser)  and follow the project on GitHub
* [Sign up](https://console.lightpanda.io/signup)  to test the cloud version
## FAQ[](#faq)
### Is Zig stable enough for production use?[](#is-zig-stable-enough-for-production-use)
Zig is still pre-1.0, which means breaking changes can happen between versions. That said, we’ve found it stable enough for our production use, especially since the ecosystem has largely standardized on tracking the latest tagged releases rather than main. The language itself is well-designed, and most changes between versions are improvements that are worth adapting to. Just be prepared to update code when upgrading Zig versions.
### What’s the hardest part about learning Zig?[](#whats-the-hardest-part-about-learning-zig)
The allocator model takes adjustment if you’re coming from garbage-collected languages. You need to think about where memory comes from and when it gets freed. But compared to Rust’s borrow checker or C++‘s memory management, it’s relatively straightforward once you understand the patterns.
### Can Zig really replace C++ for browser development?[](#can-zig-really-replace-c-for-browser-development)
For building a focused browser like Lightpanda, yes. For replacing Chromium or Firefox, that’s unlikely: those projects have millions of lines of C++ and decades of optimization. We’re more likely to see Rust complementing C++ in those projects over time, for example how Firefox is leveraging [Servo](https://github.com/servo/servo) . But for new projects where you control the codebase, Zig is absolutely viable.
### Where can I learn more about Zig?[](#where-can-i-learn-more-about-zig)
Start with the [official Zig documentation](https://ziglang.org/documentation/master/) . The [Zig Learn](https://ziglearn.org/)  site provides practical tutorials. And join the community on [Discord](https://discord.gg/zig)  or [ziggit.dev](https://ziggit.dev/)  where developers actively help newcomers. The language is simple enough that reading standard library source code is also a viable learning approach.
* * *
### Francis Bouvier
#### Cofounder & CEO
Francis previously cofounded BlueBoard, an ecommerce analytics platform acquired by ChannelAdvisor in 2020. While running large automation systems he saw how limited existing browsers were for this kind of work. Lightpanda grew from his wish to give developers a faster and more reliable way to automate the web.

# [Posts Tagged with “automation”](https://lightpanda.io/blog/tags/automation) 
 _https://lightpanda.io/blog/tags/automation_

CTRL K
## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Native Markdown Output in Lightpanda](https://lightpanda.io/blog/posts/native-markdown-output)
Lightpanda now converts web pages to markdown natively inside the browser, cutting token usage for AI agents.[Read More →](https://lightpanda.io/blog/posts/native-markdown-output)
Thu Mar 05 2026
## [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Lightpanda can now handle multiple CDP connections simultaneously. Here's what it took to get there and what it means for running concurrent browser sessions at scale.[Read More →](https://lightpanda.io/blog/posts/how-we-built-multiclient)
Fri Feb 27 2026
## [Lightpanda Now Supports robots.txt](https://lightpanda.io/blog/posts/robotstxt-support)
Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.[Read More →](https://lightpanda.io/blog/posts/robotstxt-support)
Fri Feb 20 2026
## [Why Request Interception Matters](https://lightpanda.io/blog/posts/why-request-interception-matters)
How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.[Read More →](https://lightpanda.io/blog/posts/why-request-interception-matters)
Tue Feb 10 2026
## [From Local to Real World Benchmarks](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.[Read More →](https://lightpanda.io/blog/posts/from-local-to-real-world-benchmarks)
Tue Jan 27 2026
## [CDP Under the Hood: A Deep Dive](https://lightpanda.io/blog/posts/cdp-under-the-hood)
The Chrome DevTools Protocol powers every major browser automation library, but it wasn't designed for browser automation.[Read More →](https://lightpanda.io/blog/posts/cdp-under-the-hood)
Fri Nov 28 2025
## [The Real Cost of JavaScript: Why Web Automation Isn't What It Used to Be](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Modern web architecture has made traditional HTTP crawling obsolete. JavaScript execution is now mandatory for most sites and that changes everything about infrastructure costs and scale.[Read More →](https://lightpanda.io/blog/posts/the-real-cost-of-javascript)
Mon Nov 24 2025

# [Careers | Lightpanda](https://lightpanda.io/jobs) 
 _https://lightpanda.io/jobs_

#### About Lightpanda
[Lightpanda](https://github.com/lightpanda-io/browser) is building a headless web browser from scratch, tailor-made for machine usage. Our mission is to redefine web interaction by enabling AI agents, large-scale scraping, and automated workflows to run faster, smarter, and more efficiently, without the constraints of legacy browsers. We're an ambitious team with a strong open-source foundation, led by experienced founders with a successful startup exit history, and we're now [funded](https://lightpanda.io/blog/posts/lightpanda-raises-preseed).#### Open Roles
* [Senior Software Engineer - System Programming (Zig/C++)](https://lightpanda.io/jobs/senior-software-engineer_system-programming)
* [Senior Software Engineer - Web API Implementation (Javascript/Typescript)](https://lightpanda.io/jobs/senior-software-engineer_web-api)
###### If you are interested in working with us and the job you are looking for is not listed here, don't hesitate to contact us at [careers@lightpanda.io](mailto:careers@lightpanda.io)

# [Posts Tagged with “sandbox”](https://lightpanda.io/blog/tags/sandbox) 
 _https://lightpanda.io/blog/tags/sandbox_

 Posts Tagged with “sandbox” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “sandbox”
## [Browser security in the age of AI agents](/blog/posts/browser-security-in-the-age-of-ai-agents)
AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.[Read More →](/blog/posts/browser-security-in-the-age-of-ai-agents)
Fri Aug 29 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [How We Built MultiClient into Lightpanda](https://lightpanda.io/blog/posts/how-we-built-multiclient) 
 _https://lightpanda.io/blog/posts/how-we-built-multiclient_

### Nikolay Govorov
#### Software Engineer
Friday, February 27, 2026
## TL;DR[](#tldr)
Lightpanda now handles multiple concurrent CDP (Chrome DevTools Protocol) connections in a single process. Each connection gets a dedicated OS thread and a fully isolated browser instance. When the client disconnects, everything cleans up automatically.
## The Problem with One Process, One Connection[](#the-problem-with-one-process-one-connection)
Until this landed, one Lightpanda instance meant one CDP client.
If you’re running a large scale web automation, best practice is to run dozens of parallel sessions. If you’re building AI agents, each agent needs its own browser context. Previously, the only way to scale was to manage multiple Lightpanda processes. Given Lightpanda’s performance overhead is significantly lower than Chrome, this wasn’t as much of a blocker as it may have sounded, but it still meant process orchestration, port management, and more operational overhead.
Running each connection on its own thread required working through several architectural decisions.
## Isolation Layer[](#isolation-layer)
Any modern browser consists of two layers: the browser engine (Blink in Chromium, WebKit in Safari, Gecko in Firefox) and the browser itself. The engine handles exactly one tab (even a frame will often be represented by a separate child engine instance), while the browser acts as a hypervisor: it maintains a pool of tabs and implements common functions like the UI or synchronization between computers.
This separation is clearly reflected in the process structure: browsers launch each tab as a separate system process in a sandbox, and an additional browser process for orchestration (this may remind you of the Nginx process model with a master and a worker pool). This approach allows for simpler code: a crash or vulnerability in one tab will crash the child process, but the browser will continue to run.
The problem with this approach is resource consumption. Each tab is a separate program, with separate Blink and V8 instances, complex asynchronous IPC for communicating with the main process, and sandbox overhead.
## Decision 1: One Process Architecture[](#decision-1-one-process-architecture)
To further conserve resources and scale horizontally, Lightpanda offers a single-system process architecture. Each CDP connection is a system thread that services its own browser instance (this will remind older developers of classic WebKit).
By abandoning isolation, you complicate your code, but gain several important advantages:
* Starting a new connection is reduced to selecting a free thread from the pool, instead of launching a full-fledged system process.
* A shared address makes state sharing straightforward. For example, for the HTTP cache in Chromium, you need a network process (yes, another one), but within a single process, you can simply share a pointer.
* Resource control: process termination is guaranteed to collect all resources (and you won’t leave zombies in the wild).
* Ease of debugging and monitoring: no IPC, message serialization, or asynchronous messaging. You simply call functions.
The obvious tradeoff of less isolation would be critical for a desktop browser, but not for servers: Lightpanda is already running in a container/vm/jail within your server infrastructure. Potential failures will be handled by existing tools, and another sandbox doesn’t offer a particular advantage.
The key benefit of the shared process is the ability to easily reuse resources between connections. The more you can share, the faster the connection starts and the less RAM you use.
* The **V8 environment** is the heaviest part of the process. We use a common Platform to save on preparing the environment for a new connection.
* The **ArenaPool** is a pool of memory arenas reused across page lifecycles. Lightpanda relies heavily on arenas to reduce allocations (and heap fragmentation), so the arena has also been modified to work in a multi-threaded environment.
* The **robots cache** stores parsed robots.txt data shared across requests. Same situation: reads and writes from multiple threads needed protection.
* The **notification and telemetry system** had a nested notification design that wasn’t thread-safe. The previous approach let telemetry hook into individual notifications through a shared interceptor. We simplified it: telemetry events are now triggered directly rather than through a notification chain. It removed a layer of indirection and made the threading story cleaner.
The network stack is the most difficult part to reuse. The current implementation supports an independent network client for each connection (with its own event loop on each thread).
This is reliable and simplified the migration, but there is still room for optimization here: shared connection pooling, TLS state, HTTP caching, and much more, which we will continue to work on in future versions.
## Decision 3: The V8 Isolate Problem[](#decision-3-the-v8-isolate-problem)
V8’s is the sandboxed environment where JavaScript runs. It was designed as a single-threaded creature. The Deno team [documented this clearly in 2020](https://github.com/denoland/rusty_v8/pull/272)  when they moved away from , V8’s mechanism for sharing an Isolate across threads.
We use V8 Isolate for each connection, separating only the Platform. This comes at the cost of creating a new Isolate, but it allows us to clearly separate different tabs.
The catch is startup time. Creating a fresh V8 Isolate is expensive. In the future, we might consider a reusable Isolate buffer, but this would require careful cleanup to avoid context pollution and associated potential leaks.
## What You Get Today[](#what-you-get-today)
Each CDP connection supports one browser context and one page at a time. That covers the standard usage pattern for Puppeteer and Playwright against a remote endpoint.
Connect with Puppeteer:
Connect with Playwright:
If you run both scripts at the same time against the same Lightpanda process, each gets a fully isolated browser and nothing leaks between them. Disconnect and the thread is gone.
## What’s Next?[](#whats-next)
We plan to update our official benchmarks. Multithreading changes the performance profile in ways that aren’t fully captured by single-connection numbers. We want to understand throughput at different concurrency levels, how memory scales per connection, and where the bottlenecks show up under real parallel load. Those numbers will tell us where to focus optimization work.
On the architecture side, the network subsystem has a lot of potential for optimization and better planning in scenarios with a large number of simultaneous connections. Automated testing remains an interesting topic. We already use tsan to run all tests (including v8 instrumenting), but more advanced tools like load or simulation testing may appear in the future.
## Try It[](#try-it)
Pull the latest from [main on GitHub](https://github.com/lightpanda-io/browser)  and run your workloads against it. The [quickstart guide](https://lightpanda.io/docs/quickstart/installation-and-setup)  will get you connected in a few minutes.
If something breaks, open an issue and come and chat to us on [Discord](https://discord.gg/K63XeymfB5) . We respond to every message.
* * *
### Nikolay Govorov
#### Software Engineer
Nikolay is a software engineer at Lightpanda, where he works on the core browser engine.

# [Posts Tagged with “mcp”](https://lightpanda.io/blog/tags/mcp) 
 _https://lightpanda.io/blog/tags/mcp_

## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026

# [Posts Tagged with “allocators”](https://lightpanda.io/blog/tags/allocators) 
 _https://lightpanda.io/blog/tags/allocators_

 Posts Tagged with “allocators” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “allocators”
## [Why We Built Lightpanda in Zig](/blog/posts/why-we-built-lightpanda-in-zig)
We chose Zig over C++ and Rust because we wanted a simple, modern systems language. Here's what we learned building a browser with it.[Read More →](/blog/posts/why-we-built-lightpanda-in-zig)
Fri Dec 05 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “dom”](https://lightpanda.io/blog/tags/dom) 
 _https://lightpanda.io/blog/tags/dom_

⌘K
## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Migrating our DOM to Zig](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.[Read More →](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
Thu Jan 08 2026

# [Lightpanda browser now uses libcurl](https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl) 
 _https://lightpanda.io/blog/posts/lightpanda-browser-now-uses-libcurl_

### Pierre Tachoire
#### Cofounder & CTO
Thanks to ＃922  , we’ve switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + [zig.tls](https://github.com/ianic/tls.zig)  to [libcurl](https://curl.se/libcurl/) .
The HTTP client is a crucial part of any browser engine.
Over the past two years, we’ve experimented a lot, starting with the Zig standard library, then building our own custom client. The main goal was always the same: handle both synchronous and asynchronous requests using non-blocking io.
Our in-house solution worked, but it came with trade-offs. Every new feature or bug fix meant increasingly complex code maintenance. We were spending more time wrestling with the client than building the browser itself.
## Why now[](#why-now)
Our next big feature will be the implementation of [CDP request interception](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-setRequestInterception) .
In short, request interception lets the browser pause any HTTP request and ask the client what to do: allow, block, modify, or mock any request. It’s a core feature for advanced CDP clients who need to filter, track, log, or inject cached data.
Implementing this properly required a big change to our HTTP client. Some requests need to pause without blocking others that are already in flight. In our previous setup, all initial fetches were synchronous, which made this impossible.
Instead of trying to adapt our custom client to handle this, we switched to libcurl. This allows us to implement parallelization for the initial fetch of the document. Even if we had to execute JS in sequential order, we are now loading the resources at the same time, accelerating a real web page loading and offering a way to pause requests and implement request interceptions.
## What this means for developers[](#what-this-means-for-developers)
Switching to libcurl comes with a bunch of benefits that make life easier for anyone building on Lightpanda:
* Better TLS support: we now use mbedTLS, which fixes tricky TLS issues on some websites
* HTTP/2 support: modern web requests run faster than ever
* Proxy support: works smoothly with both plain and secure HTTP proxies
* Detailed debug output: dumping request details is now much easier
In short, libcurl gives us a more solid, flexible foundation, letting us focus on speed, request interception, and all the exciting features coming next.
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Careers | Lightpanda](https://lightpanda.io/jobs/senior-software-engineer_system-programming) 
 _https://lightpanda.io/jobs/senior-software-engineer_system-programming_

[Back](https://lightpanda.io/jobs)
## Senior Software Engineer - System Programming (Zig/C++)
## Location
Paris or EU (Remote)
## About Lightpanda
[Lightpanda](https://github.com/lightpanda-io/browser) is building a headless web browser from scratch, tailor-made for machine usage.
Our mission is to redefine web interaction by enabling AI agents, large-scale scraping, and automated workflows to run faster, smarter, and more efficiently, without the constraints of legacy browsers.
We're an ambitious team with a strong open-source foundation, led by experienced founders with a successful startup exit history, and we're now [funded](https://lightpanda.io/blog/posts/lightpanda-raises-preseed).
You'd be joining our team at an early stage, with equity incentives that reflect that.
## About this role
We’re seeking a skilled and diligent full-time software engineer to join our growing team. You will work as part of the engineering team to develop our open-source headless browser.
## What you will do:
* Work as part of a team of engineers to design, build, test, and document the browser
* Improve the quality, efficiency, scalability, and stability of the browser
* Improve the binding framework with V8 JS engine
* Implement Web APIs and Chrome Devtools Protocol in Zig
## What we’re looking for:
* Experience with system programming/low level language Zig, C++, C
* Familiarity with Web APIs and front-end JS technologies
* Comfortable working on an open source project and interacting with the community
* Familiarity with the internals of JavaScript runtimes (v8 or other) is a plus
* Ability to give and process constructive feedback, as well as work independently
* Flexibility to adjust to the dynamic nature of a startup
## To apply
Send an email to [careers@lightpanda.io](mailto:careers@lightpanda.io) and include your resumé, past projects, work, current location, and GitHub

# [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp) 
 _https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp_

### Adrià Arrufat
#### Software Engineer
Wednesday, March 11, 2026
## TL;DR[](#tldr)
When we released [](https://lightpanda.io/blog/posts/native-markdown-output), we introduced the domain as Lightpanda’s home for CDP commands built for machines, not debugging. We’ve added: , , and . We’ve also shipped a native [Model Context Protocol](https://modelcontextprotocol.io/)  (MCP) server built directly into the Lightpanda binary, which exposes the same capabilities (markdown, semantic tree, JavaScript evaluation) without requiring CDP or automation libraries.
## Expanding the LP Domain[](#expanding-the-lp-domain)
When we released [native markdown output](https://lightpanda.io/blog/posts/native-markdown-output) , we introduced the domain as a home for Lightpanda-specific CDP commands that go beyond what the standard [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)  offers. was the first command. We said more were coming.
That solved the content reading problem. But agents don’t only read, they need to act on pages, understand what’s interactive, and extract structured metadata. Each of these required agents to do complex work outside the browser: injecting JavaScript, parsing DOM trees, running heuristics.
The three new commands push that work into the engine.
## LP.getSemanticTree[](#lpgetsemantictree)
The problem with feeding page structure to LLMs is well known. The typical approach is to grab the [Accessibility Tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree)  from Chrome via CDP. In practice, this means calling and separately, then cross-referencing both trees in your agent framework to map ARIA roles to actual elements. You end up writing heuristics to filter invisible elements, running CPU-heavy scripts to determine what’s clickable, and dealing with sync issues when the page changes mid-extraction.
Agent frameworks like [Stagehand](https://www.stagehand.dev/)  and [Browser Use](https://browser-use.com/)  all do this work in their own way, but they’re all solving the same problem outside the browser.
Because we control the entire stack, we pushed this into the engine. traverses the live DOM in a single pass and returns a pruned, structured representation. Like , it operates on the DOM after JavaScript has executed, so you get the actual rendered state of the page.
Here’s what happens in that single pass:
* Extracts tag names, XPaths, ARIA roles, and computed accessible names
* Checks the internal EventManager for bound , , or listeners to determine interactivity (no guessing based on tag names)
* Streams output directly to the WebSocket to avoid allocating large intermediate buffers
## Compound Component Unrolling[](#compound-component-unrolling)
One persistent pain point for agents is compound components. A dropdown might have 50 options, but those options are hidden in the DOM until a user clicks. Agents typically fail here because the visible representation doesn’t contain the choices.
Lightpanda natively “unrolls” compound components. For a , the semantic tree output includes the full set of options attached directly to the node:
No extra CDP calls and no JavaScript injection to enumerate options because the browser already knows what’s there.
### Text Format for Token Efficiency[](#text-format-for-token-efficiency)
For agents that need minimal overhead, supports a compressed text format. Pass and you get output like this:
Each line is a node ID, its role, its accessible name, and any relevant state. This is what gets sent to the LLM.
## LP.getInteractiveElements[](#lpgetinteractiveelements)
gives agents the full pruned structure of a page. answers a narrower question: what can I click, type into, or interact with?
AI agents today often determine this by taking screenshots, overlaying numbered markers, and sending them to a vision LLM. That’s slow, expensive, and error-prone. Lightpanda can answer this natively because it already tracks all event listeners internally.
returns every actionable element on the page in a single call. It classifies each element into one of five interactivity types:
Type
Criteria
`native`
`button`, `a[href]`, `input` (except hidden), `select`, `textarea`, `details`, `summary`
`aria`
Elements with an interactive ARIA `role` (`button`, `link`, `tab`, `menuitem`, `checkbox`, `radio`, `slider`, `combobox`, `switch`, etc.)
`contenteditable`
Elements with `contenteditable="true"`
`listener`
Elements with `addEventListener` or inline handler registrations (`onclick`, etc.)
`focusable`
Elements with explicit `tabindex >= 0` that aren’t otherwise interactive
Here’s what a result looks like:
The key detail: listener detection is O(1) per element. Lightpanda pre-builds a target-to-event-types map from its internal EventManager in a single pass. Classification and type collection are then simple map lookups. Chrome’s is debug-only and requires per-element calls. does it in one shot across the entire DOM.
The array maps 1:1 to elements and all nodes are registered in the CDP node registry. Your agent can immediately use them in follow-up calls like or .
## LP.getStructuredData[](#lpgetstructureddata)
The fourth command extracts all machine-readable structured data from a page in a single call.
Modern websites embed structured metadata that’s valuable for agents: product information, article details, event data, reviews, FAQs, breadcrumbs. This data is already in the page, but extracting it traditionally means injecting JavaScript to parse tags, read properties, and resolve relative URLs.
does this natively with a single-pass TreeWalker over the DOM. Here’s what it extracts:
Format
Source
Adoption
JSON-LD
`<script type="application/ld+json">`
41% of pages ([Web Almanac 2024](https://almanac.httparchive.org/en/2024/structured-data) )
Open Graph
`<meta property="og:*">`
64%
Twitter/X Cards
`<meta name="twitter:*">`
45%
HTML meta
`<title>`, `<meta name="...">`, charset
~100%
Link elements
`<link rel="canonical,icon,manifest,alternate">`
~100%
JSON-LD is particularly valuable for agents. It gives them structured [Schema.org](https://schema.org/)  data (products, articles, events, reviews) without any parsing or heuristics. Google explicitly recommends JSON-LD, and it appears on [41% of pages](https://almanac.httparchive.org/en/2024/structured-data)  with adoption growing year over year.
## Using the LP Commands[](#using-the-lp-commands)
All four LP commands follow the same pattern. You open a CDP session and call them directly.
With Puppeteer:
With Playwright:
## Four Commands, One Page[](#four-commands-one-page)
Together, these four commands give agents a complete view of any web page:
Format
Best For
Token Cost
Key Advantage
**Raw HTML**
**Data extraction.** When you need exact attributes, classes, or nested data structures for a parser.
🔴 High
Most complete data; exactly what the browser sees.
**LP.getMarkdown**
**Content analysis.** When the agent needs to read articles, product descriptions, or documentation.
🟡 Medium
Strips layout noise while preserving text hierarchy and links.
**LP.getSemanticTree**
**Web navigation & action.** When the agent needs to click buttons, fill forms, or select dropdowns.
🟢 Low
Focuses on interactivity. Includes XPaths and unrolled `<select>` options.
**LP.getInteractiveElements**
**Taking action.** When the agent needs a flat list of everything it can click, type into, or select.
🟢 Low
Every actionable element with listener types and node IDs for follow-up calls.
**LP.getStructuredData**
**Understanding context.** When the agent needs product info, article metadata, JSON-LD, or Open Graph.Understanding context. When the agent needs product info, article metadata, JSON-LD, or Open Graph.
🟢 Low
Machine-readable metadata already embedded in the page, extracted in one call.
The pattern across all four LP commands is the same: if the browser already has the data, the browser should do the transformation. There’s no JavaScript injection, no multi-call CDP sequences, and no external libraries.
## Native MCP Server[](#native-mcp-server)
The LP domain gives you access to these capabilities through CDP, but not every agent needs CDP. If your agent framework speaks [MCP](https://modelcontextprotocol.io/) , you can skip the automation library entirely.
We already have [gomcp](https://github.com/lightpanda-io/gomcp) , a Go-based MCP server that bridges MCP to Lightpanda over CDP. It works, and it’s a good option if you want a standalone server with SSE support.
But gomcp is still a bridge. The MCP client talks to gomcp, gomcp talks CDP to Lightpanda, and you’re back to multi-layer serialization. So we built an MCP server directly into the Lightpanda binary. Your agent connects over standard I/O. One process, no bridging.
### Configuration[](#configuration)
Point any MCP-compatible client at the Lightpanda binary:
Now your agent can discover Lightpanda’s capabilities automatically through the MCP protocol.
### Same Engine, Different Interface[](#same-engine-different-interface)
The native MCP server exposes the same engine-level features as the LP domain, surfaced as MCP tools and resources rather than CDP commands.
The markdown tool calls the same conversion that powers . The tool calls the same traversal behind . There is no translation layer or intermediate processing. The MCP server invokes these capabilities directly in the Zig engine.
Here’s the full set of tools:
* **goto**: Navigate to a URL and load the page into memory
* **markdown**: Get the page content as token-efficient markdown (same as )
* **semantic\_tree**: Get the pruned, interactive DOM representation (same as )
* **links**: Extract all links from the loaded page
* **interactiveElements**: Collect buttons, inputs, and other interactive elements
* **structuredData**: Extract JSON-LD, OpenGraph, and semantic metadata
* **evaluate**: Run arbitrary JavaScript in the page context
Agents can also read page state as MCP resources: for the raw DOM and for cleaned markdown.
## Where the LP Domain Is Going[](#where-the-lp-domain-is-going)
The LP domain is where we’re building CDP commands that make sense when automation is the primary goal because standard CDP was [designed for debugging](https://lightpanda.io/blog/posts/cdp-under-the-hood) , not for machines. The LP domain is for machines, and the native MCP server ensures those same capabilities are available to agents that don’t use CDP at all.
We’re continuing to add commands that reduce the work agents have to do outside the browser.
### Get Started[](#get-started)
Try the [quickstart guide](https://lightpanda.io/docs/quickstart/installation-and-setup)  to get Lightpanda running in under 10 minutes. Working examples for both [Puppeteer](https://github.com/lightpanda-io/demo/tree/main/puppeteer)  and [Playwright](https://github.com/lightpanda-io/demo/tree/main/playwright)  are in the demo repo.
## FAQ[](#faq)
### What is LP.getSemanticTree?[](#what-is-lpgetsemantictree)
is the second command in Lightpanda’s custom CDP domain. It extracts a pruned, LLM-optimized representation of the page DOM, combining tag names, ARIA roles, computed names, XPaths, and interactivity detection in a single engine-level pass.
### How is this different from LP.getMarkdown?[](#how-is-this-different-from-lpgetmarkdown)
[](https://lightpanda.io/blog/posts/native-markdown-output)converts the DOM to readable text, optimized for content consumption. produces a structured representation focused on interactivity, including element roles, XPaths, and unrolled compound components like dropdowns. Use markdown when the agent needs to read. Use the semantic tree when the agent needs to act.
### Can I access the semantic tree through MCP instead of CDP?[](#can-i-access-the-semantic-tree-through-mcp-instead-of-cdp)
Yes. The native MCP server exposes LP.getSemanticTree as the tool. The underlying engine capability is the same. MCP is the simpler path if your agent doesn’t need the full CDP automation stack.
### How does the native MCP server differ from gomcp?[](#how-does-the-native-mcp-server-differ-from-gomcp)
[gomcp](https://github.com/lightpanda-io/gomcp)  is a separate Go binary that bridges MCP to Lightpanda over CDP. The native MCP server runs inside the browser process, calling engine capabilities directly without CDP as an intermediary. Both support stdio transport. gomcp additionally supports SSE.
### Does LP.getSemanticTree work with existing agent frameworks?[](#does-lpgetsemantictree-work-with-existing-agent-frameworks)
Yes. The JSON output includes , , and unique XPaths, making it compatible with frameworks that need element references for interaction. The text format is designed for direct inclusion in LLM prompts.
### What MCP transport does Lightpanda support?[](#what-mcp-transport-does-lightpanda-support)
The native MCP server supports standard I/O (stdio) for local use. The [cloud MCP service](https://lightpanda.io/docs/cloud-offer/tools/mcp)  supports SSE transport for remote connections.
### Is the LP domain compatible with standard CDP?[](#is-the-lp-domain-compatible-with-standard-cdp)
The domain is a Lightpanda-specific extension. It is not part of the Chrome DevTools Protocol specification. Standard CDP commands continue to work as expected. The LP domain adds new capabilities on top.
* * *
### Adrià Arrufat
#### Software Engineer
Adrià is an AI engineer at Lightpanda, where he works on making the browser more useful for AI workflows. Before Lightpanda, Adrià built machine learning systems and contributed to open-source projects across computer vision and systems programming.

# [Posts Tagged with “architecture”](https://lightpanda.io/blog/tags/architecture) 
 _https://lightpanda.io/blog/tags/architecture_

## [New LP Domain Commands and Native MCP](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
The LP domain grows with LP.getSemanticTree, LP.getInteractiveElements, and LP.getStructuredData alongside a native MCP server built into the browser binary that exposes the same engine capabilities without CDP.[Read More →](https://lightpanda.io/blog/posts/lp-domain-commands-and-native-mcp)
Wed Mar 11 2026
## [Migrating our DOM to Zig](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
We replaced LibDOM with a custom Zig implementation for better cohesion across events, Custom Elements, and ShadowDOM. Here's how we built it and what we learned along the way.[Read More →](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig)
Thu Jan 08 2026

# [Posts Tagged with “agents”](https://lightpanda.io/blog/tags/agents) 
 _https://lightpanda.io/blog/tags/agents_

 Posts Tagged with “agents” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “agents”
## [Browser security in the age of AI agents](/blog/posts/browser-security-in-the-age-of-ai-agents)
AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.[Read More →](/blog/posts/browser-security-in-the-age-of-ai-agents)
Fri Aug 29 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “network”](https://lightpanda.io/blog/tags/network) 
 _https://lightpanda.io/blog/tags/network_

 Posts Tagged with “network” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “network”
## [Lightpanda Now Supports robots.txt](/blog/posts/robotstxt-support)
Why we added robots.txt support, how the singleflight cache works, and why the feature is opt-in.[Read More →](/blog/posts/robotstxt-support)
Fri Feb 20 2026
## [Why Request Interception Matters](/blog/posts/why-request-interception-matters)
How we built request interception in Lightpanda and why the async coordination between your HTTP client and CDP WebSocket is the part that really matters.[Read More →](/blog/posts/why-request-interception-matters)
Tue Feb 10 2026
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Careers | Lightpanda](https://lightpanda.io/jobs/senior-software-engineer_web-api) 
 _https://lightpanda.io/jobs/senior-software-engineer_web-api_

[Back](https://lightpanda.io/jobs)
## Senior Software Engineer - Web API Implementation (Javascript/Typescript)
## Location
Paris or EU (Remote)
## About Lightpanda
[Lightpanda](https://github.com/lightpanda-io/browser) is building a headless web browser from scratch, tailor-made for machine usage.
Our mission is to redefine web interaction by enabling AI agents, large-scale scraping, and automated workflows to run faster, smarter, and more efficiently, without the constraints of legacy browsers.
We're an ambitious team with a strong open-source foundation, led by experienced founders with a successful startup exit history, and we're now [funded](https://lightpanda.io/blog/posts/lightpanda-raises-preseed).
You'd be joining our team at an early stage, with equity incentives that reflect that.
## About this role
We’re seeking a skilled and diligent Software Engineer to join our growing team. You’ll work as part of the engineering team to develop Lightpanda’s browser, focusing on expanding compatibility and ensuring real-world reliability.
## What you will do
* Test the browser against websites, analyze and debug Javascript execution issues
* Detect, implement and test missing Web APIs in Zig and/or in Javascript
* Understand, deobfuscate, reproduce failing Javascript code
* Identify missing browser features and help the core team to improve functionality
* Improve, write and maintain the browser’s test suite (unit, WPT, end-to-end)
## What we are looking for
* Strong experience with Javascript and/or Typescript development
* Experience with Zig and/or a desire to learn it
* Ability to give and process constructive feedback, and work independently
* Comfort with the fast-moving and dynamic nature of an early-stage startup
## Bonus
* Experience of other programming languages, like C, C++, Go
* Familiarity with Web API standards and the Chrome Debug Protocol
* Experience with end-to-end testing/scraping tools like Puppeteer and Playwright
## To apply
Send an email to [careers@lightpanda.io](mailto:careers@lightpanda.io) and include your resumé, past projects, work, current location, and GitHub

# [Getting started - Documentation | Lightpanda](https://lightpanda.io/docs/cloud-offer/getting-started) 
 _https://lightpanda.io/docs/cloud-offer/getting-started_

Cloud offer
Getting started
## Create an account[](#create-an-account)
You can create a new account with an email on [https://lightpanda.io](https://lightpanda.io/#cloud-offer) .
You will receive an invitation by email to generate your token. Be careful to save your token, we won’t display it again.
## Start using a browser[](#start-using-a-browser)
With your token, you can immediately use a remote browser with your CDP client.
Example using [Playwright](https://playwright.dev/) .
 import playwright from "playwright-core";
 
 const browser = await playwright.chromium.connectOverCDP(
 "wss://euwest.cloud.lightpanda.io/ws?token=TOKEN",
 );
 const context = await browser.newContext();
 const page = await context.newPage();
 
 //...
 
 await page.close();
 await context.close();
 await browser.close();
You have access to Lightpanda and Chromium browsers.
ℹ️
Depending on your location, you can connect using the url `wss://euwest.cloud.lightpanda.io/ws` or `wss//uswest.cloud.lightpanda.io/ws`.
## Sign in to the dashboard[](#sign-in-to-the-dashboard)
You can access your dashboard on [https://console.lightpanda.io](https://console.lightpanda.io/) .
Use your email and your token to log in.
In the dashboard, you can review your last browsing sessions.
[Systems requirements](https://lightpanda.io/docs/open-source/systems-requirements "Systems requirements")[CDP](https://lightpanda.io/docs/cloud-offer/tools/cdp "CDP")

# [Migrating our DOM to Zig](https://lightpanda.io/blog/posts/migrating-our-dom-to-zig) 
 _https://lightpanda.io/blog/posts/migrating-our-dom-to-zig_

### Karl Seguin
#### Software Engineer
Thursday, January 8, 2026
## TL;DR[](#tldr)
We replaced LibDOM with our own Zig-based DOM implementation. The original design created friction between V8, our Zig layer, and LibDOM, especially around events, Custom Elements, and ShadowDOM. After six months of spare-time prototyping, we built zigdom: a leaner, more cohesive DOM that gives us full control over memory, events, and future enhancements. We also swapped in html5ever for parsing and added V8 snapshots to cut startup time. There are single-digit % performance gains, but the real win is a unified codebase that’s easier to extend.
## Why We Replaced LibDOM[](#why-we-replaced-libdom)
At a high level, the Lightpanda codebase can be described as a Zig layer sitting between V8 and LibDOM. When JavaScript is executed, like , V8 calls into the Zig layer which then forwards the request to the underlying LibDOM document object and then forwards the result back to V8. By using LibDOM, we gained a robust and fairly comprehensive DOM implementation with minimal effort.
However, as we worked to increase compatibility with websites in the wild, we felt ever-increasing friction between our three layers. One example is the event system baked into LibDOM. This proved awkward to expand beyond DOM-based events (e.g. input events) or even just bubbling DOM events to our Zig-based Window implementation. Another larger challenge, was integrating support for Custom Elements and ShadowDOM, written in Zig, with LibDOM. Finally, there was some concern about the lack of cohesion with respect to things like memory management and how that would impact potential future changes, like better multi-threading support.
If we were to restart the integration from scratch, knowing what we know now, we’d probably be able to avoid most of the friction we’re currently seeing. While we do modify LibDOM as needed, one approach would be to integrate V8 and LibDOM directly, applying fixes and additions directly to LibDOM. But as we wrote before, we’re [fans of Zig](https://lightpanda.io/blog/posts/why-we-built-lightpanda-in-zig)  so the discussions and prototypes we built always leaned towards replacing LibDOM with a custom Zig implementation.
### zigdom[](#zigdom)
Work on a prototype for having a Zig-based DOM started roughly six months ago. This was a casual in-our-spare-time effort. In the spirit of experimentation, this prototype also replaced V8 with [QuickJS-NG](https://github.com/quickjs-ng/quickjs) . By mid-November, we felt the prototype had tackled enough unknowns to start integrating it into Lightpanda (with V8). Thankfully, porting features was relatively simple; commits to the branch could usually be ported to the branch.
The design is straightforward. A has a linked list of children and an optional . Furthermore, a has a tagged union field to represent the type of node, and a field to capture its supertype:
Since a modern website can have tens of thousands of nodes and thousands of elements, we obviously care about the size of our , and . That’s why every type in our union is a pointer. That means that when we create a div, we need to allocate the Div, HTMLElement, Element, Node and EventTarget. But rather than doing five separate allocations, we do 1 large allocation for the total size and parcel it out.
Another area where we’ve been able to optimize for our use-case is to lazily parse/load certain properties. While a website might have thousands of elements, most JavaScript will only access the classes, styles, relLists, dataset, etc, of a few elements. Rather than having these stored on each element, even as empty lazily loaded containers, they’re attached to a page in an element -> property lookup. While this adds lookup overhead, it removes ~6 pointers from every element.
The real win is having a more cohesive design for events, custom elements and ShadowDOM and a simpler foundation for future enhancements. That said, performance, both in terms of memory usage and CPU load are slightly improved (both single digit % improvements).
### html5ever[](#html5ever)
We saw benefits to writing our own DOM implementation, but not our own HTML parser. For that, we turned to [servo’s](https://servo.org/)  [html5ever](https://github.com/servo/html5ever)  written in Rust. I almost forgot to mention it in this post because the experience was so painless and worked from the get-go that I haven’t had to think about it for a while. You setup html5ever with a bunch of callbacks (for creating a node, attaching a node to a parent, creating text, etc.), feed it your HTML, and away you go. My Rust is very bad, but writing a C binding for it was manageable.
### Bonus - V8 Snapshot[](#bonus---v8-snapshot)
Some of the porting was tedious. For a change of pace, I took time to see how we could leverage V8 snapshots. As a short summary, whenever you create a V8 environment to execute code, you have to do a lot of setup. Every type (hundreds) with all the functions and properties need to be registered with the V8 environment. For a simple page, this can represent anywhere from 10-30% of the total time. V8 snapshots let you setup a pseudo-environment upfront, extract a Snapshot (a binary blob), and use that blob to bootstrap and speedup future environments.
When in debug mode, we generated the snapshot on startup. In release mode, the snapshot is generated at compile-time and embedded into the binary, reducing startup time and memory. The overall impact depends on the relative cost of setting up the environment vs processing the page. Complex websites that load hundreds of external scripts probably won’t benefit. But incremental improvements hopefully add up and, if nothing else, help balance the performance cost of new features and complexity.
### AI Coding Agent[](#ai-coding-agent)
This was the first large feature that I developed with the aid of an AI coding agent - specifically Claude. The experience was positive, but not flawless. I’ve personally always liked participating in code reviews / PRs. I can spend hours every day reviewing PRs, so working with Claude is kind of fun for me. If reading code isn’t something you consider fun, it could be a frustrating experience.
I was almost always impressed with the quality of code written and “understanding” that Claude exhibited. I’m only guessing here, but I have to imagine that building a DOM, something which has a very explicit specification, tons of documentation and many implementations, was an ideal task for a coding agent.
That said, I do think this is first and foremost a code-review exercise, and the Claude CLI is lacking in that respect. When you’re trying to understand and think through a change, you need a comfortable interface that lets you navigate and access whatever context you’re missing. Anything more than a few lines becomes challenging to review, especially as it’s presented for you to accept one piece at a time.
In the end, it’s a tool that supplements my own abilities.
## What’s Next[](#whats-next)
Implementing our own DOM from scratch should make it easier for us to add new features and enhancements. Something we’ve already seen with better custom element and ShadowRoot support. Much of the benefits don’t come directly from implementing a new DOM, but by simply having a more cohesive codebase. For us, expanding our usage of Zig made the most sense.
zigdom is now merged into Lightpanda’s main branch. If you want to see how we structured the Node, Element, and event system in Zig, check out the [source code on GitHub](https://github.com/lightpanda-io/browser) .
* * *
### Karl Seguin
#### Software Engineer
Karl is a software engineer, creator of popular open-source Zig libraries like http.zig or websocket.zig. Karl has been writing about programming for years on his blog openmymind.net and is the author of Learning Zig, a series of articles to help other developers pick up the language. At Lightpanda, he works on building the core browser engine.

# [Posts Tagged with “security”](https://lightpanda.io/blog/tags/security) 
 _https://lightpanda.io/blog/tags/security_

 Posts Tagged with “security” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “security”
## [Browser security in the age of AI agents](/blog/posts/browser-security-in-the-age-of-ai-agents)
AI agents introduce new security risks when given direct browser access. Lightpanda explores how a lightweight browser with instant startup can mitigate these threats.[Read More →](/blog/posts/browser-security-in-the-age-of-ai-agents)
Fri Aug 29 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Posts Tagged with “benchmark”](https://lightpanda.io/blog/tags/benchmark) 
 _https://lightpanda.io/blog/tags/benchmark_

 Posts Tagged with “benchmark” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
⌘K
# Posts Tagged with “benchmark”
## [From Local to Real World Benchmarks](/blog/posts/from-local-to-real-world-benchmarks)
We tested Lightpanda against Chrome on 933 real pages over the network. At 25 parallel tasks: 16x less memory, 9x faster.[Read More →](/blog/posts/from-local-to-real-world-benchmarks)
Tue Jan 27 2026
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [What Is a True Headless Browser?](https://lightpanda.io/blog/posts/what-is-a-true-headless-browser) 
 _https://lightpanda.io/blog/posts/what-is-a-true-headless-browser_

### Pierre Tachoire
#### Cofounder & CTO
Friday, November 14, 2025
## TL;DR[](#tldr)
Most “headless” browsers aren’t really headless. They’re just regular consumer browsers running with the display turned off. A true headless browser skips all the graphical rendering, building only what programs need (the DOM tree) while ignoring everything designed for human eyes (images, fonts, CSS layout). This approach can reduce resource usage by 60-80% for automation workloads.
## What “Headless” Usually Means[](#what-headless-usually-means)
When you launch Chrome with the flag, Chrome starts up completely, loads its entire rendering engine, processes CSS, downloads fonts and images, calculates layouts, paints pixels to framebuffers.
This made sense when headless mode was created. The Chrome team took their existing codebase and added a flag to skip displaying the window. Minimal code changes, maximum compatibility. Every website that works in regular Chrome works in Headless Chrome because it’s literally the same browser.
But for automation it’s massive overkill.
## What Programs Actually Need[](#what-programs-actually-need)
Let’s break down what happens when a browser loads a web page:
1. **Fetch HTML** over the network
2. **Parse HTML** into a DOM (Document Object Model) tree
3. **Fetch and execute JavaScript** that manipulates the DOM
4. **Fetch and parse CSS** to apply styling rules
5. **Calculate layout** (where everything goes on screen)
6. **Fetch images and fonts** for display
7. **Paint pixels** to render the visual result
8. **Composite layers** for smooth scrolling and animations
Automation scripts only interact with steps 1-3. You navigate to a page, you query the DOM for elements, you interact with those elements through JavaScript.
Steps 4-8 exist entirely for human eyeballs. A program doesn’t care about the exact button’s position, whether the font is Arial or Helvetica, or if there’s a smooth fade-in animation. The program just needs to know the button exists in the DOM and can be clicked.
## The Real Cost of Rendering[](#the-real-cost-of-rendering)
### CSS Processing[](#css-processing)
CSS parsers convert stylesheets into rule trees. Layout engines calculate positions, sizes, margins, and paddings for every element. For a typical e-commerce page with 2,000+ DOM nodes and hundreds of CSS rules, this becomes serious computation.
Your automation script doesn’t care if the price is positioned 20 pixels from the top or 200 pixels. It just needs from the DOM.
### Image Decoding[](#image-decoding)
Modern web pages load dozens of images: product photos, logos, icons, background images. Chrome downloads them, decodes JPEG/PNG/WebP formats into pixel data, and stores them in texture memory.
For automation extracting text data, every image download is wasted bandwidth and every decoded image is wasted bandwidth, time and memory.
### Font Loading[](#font-loading)
Web fonts have become standard. A single page might load 3-4 font files totaling several megabytes. Chrome downloads them, parses the font metrics, and prepares glyph rendering.
Your scraper reading only needs the text content, not the custom typeface.
### Layout Calculation[](#layout-calculation)
This is where Chrome figures out where every box goes on screen. It’s complex: flexbox, grid, floats, absolute positioning, responsive breakpoints. The engine recalculates layouts when the DOM changes or the window resizes.
Automation doesn’t need real x/y coordinates. It queries elements by selectors and reads their attributes.
## What Does “True Headless” Mean?[](#what-does-true-headless-mean)
A true headless browser builds only what programs need: the DOM tree and JavaScript execution environment. Here’s what **Lightpanda** does differently:
Chrome
Lightpanda
Fetch HTML over the network
Yes
Yes
Parse HTML into a DOM tree
Yes
Yes
Fetch and execute JavaScript that manipulates the DOM
Yes
Yes
Fetch and parse CSS to apply styling rules
Yes
No
Calculate layout
Yes
No
Fetch images and fonts for display
Yes
No
Paint pixels to render the visual result
Yes
No
Composite layers for smooth scrolling and animations
Yes
No
The result is a DOM tree in memory that your automation can interact with through standard APIs. When you call , you get the element. When you call , you get the text. The DOM exists but the visual rendering doesn’t.
The DOM tree structure is identical. The JavaScript execution works the same but under the hood, Lightpanda never downloads a single font or image and never calculates a single layout dimension.
## What You Give Up[](#what-you-give-up)
Lightpanda makes tradeoffs. You need to understand what you’re giving up:
### No Visual Regression Testing[](#no-visual-regression-testing)
You can’t take screenshots of pages that aren’t rendered. If you need to verify that button’s exact position or that an image displays correctly, you need actual rendering.
Lightpanda uses the same API as Chrome (CDP). This means you can run the same script in your workflows if you need to take a screenshot at buildtime, but not every time you extract the data or take an action on the page.
### No Layout-Dependent Interactions[](#no-layout-dependent-interactions)
Some interactions depend on visual layout. “Click the element at coordinates (100, 200)” requires knowing where things are positioned. “Click the third visible item” requires knowing which items are actually visible based on CSS display properties.
Lightpanda handles selector-based interactions fine: “click the button with class ‘submit’” works because that’s a DOM query. Coordinate-based interactions don’t work because there are no real coordinates.
## When to Use Lightpanda[](#when-to-use-lightpanda)
Here’s our recommended decision framework:
**Use Lightpanda when:**
* Extracting data (scraping, monitoring, indexing)
* Running functional tests that check behavior, not appearance
* Automating form submissions and workflows
* Generating reports from web-based dashboards
* Running at scale where resource costs matter
**Use Headless Chrome when:**
* Taking screenshots or PDFs
* Visual regression testing
* Testing responsive design breakpoints
* Debugging layout issues
* Working with sites that absolutely require rendering
**Use Headful Chrome when:**
* Developing and debugging automation scripts
* Need to see what’s happening in real-time
* Testing actual user experience
## Ready to Experience What a True Headless Browser Feels Like?[](#ready-to-experience-what-a-true-headless-browser-feels-like)
### Making the Switch[](#making-the-switch)
If you’re currently using Puppeteer or Playwright with Headless Chrome, switching to Lightpanda requires minimal code changes. The Chrome DevTools Protocol (CDP) compatibility means your automation scripts mostly work as-is.
Start by testing your automation suite against Lightpanda in a development environment. For scripts that don’t work, you can run hybrid setups and fallback to Chrome when you need rendering.
### Ready to try it?[](#ready-to-try-it)
* [Get started](https://lightpanda.io/docs/quickstart/installation-and-setup)  and run your first Lightpanda script in under 10 minutes
* [Read the docs](https://lightpanda.io/docs/cloud-offer/tools/cdp)  to learn how to connect with Puppeteer or Playwright
* [Star the project](https://github.com/lightpanda-io/browser)  on GitHub to stay up to date with the latest developments
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Privacy Policy - Lightpanda | The headless browser](https://lightpanda.io/legal) 
 _https://lightpanda.io/legal_

## Legal
## Owner and Publisher
The owner and publisher of this website is Selecy SAS, incorporated under French law.
## Hosting Provider
The hosting provider of this website is Cloudflare, Inc.
## Company Information
Selecy SAS 
Capital of €1,805.91 
8 rue du Faubourg Poissonniere 75010 Paris, France 
Registered under number 912 597 333 RCS Paris 
VAT No: FR88912597333
## Management
CEO: Francis Bouvier 
CTO: Pierre Tachoire 
COO: Katie Brown
## Additional Legal Information
_Intellectual Property:_ All content on this website, including text, graphics, logos, and images, is the property of Selecy SAS and is protected by intellectual property laws._Liability:_ Selecy SAS is not liable for any damages arising from the use of this website. While we strive to ensure the accuracy of the information provided, we do not guarantee that it is error-free or complete._Privacy:_ Please refer to our Privacy Policy for details on how we collect, use, and protect your personal information._Cookies:_ This website does not use cookies to track individual visitors. Any data collected is anonymous and used solely for statistical purposes._Governing Law:_ This website is governed by the laws of France. Any disputes arising from the use of this website will be subject to the exclusive jurisdiction of the courts of France._Changes to Legal Information:_ We reserve the right to update this legal information at any time. Please check this page periodically for any changes.

# [Lightpanda raises pre-seed <br /> to develop the first browser built for machines and AI](https://lightpanda.io/blog/posts/lightpanda-raises-preseed) 
 _https://lightpanda.io/blog/posts/lightpanda-raises-preseed_

### Katie Brown
#### Cofounder & COO
We’re excited to share that Lightpanda has raised a pre-seed round to build the first browser designed from the ground up for machines. The round is led by ISAI, with participation from a group of exceptional angel investors including the founders of Mistral, Hugging Face and Dust.
## Why now?[](#why-now)
Modern AI systems are beginning to rely on the web in new ways. Whether for LLM training, agentic workflows, or structured data extraction, the browser is increasingly used as an interface between AI and the real world. But today’s web browsers were never designed for this shift.
Even “headless” browsers inherit the structure and overhead of visual browsers. They’re built on rendering engines optimized for human interaction and visual accuracy, not for speed, efficiency, or automation. The result is fragile, bloated infrastructure with high resource costs, limited control, and no native support for the programmatic interactions modern AI systems require.
## Lightpanda takes a different approach[](#lightpanda-takes-a-different-approach)
We’re building an open source browser from first principles, assuming the user is a machine, not a human.
Lightpanda removes the graphical composition entirely. It launches in milliseconds, uses a fraction of the memory, and integrates directly with the Chrome DevTools Protocol for compatibility with libraries like Playwright and Puppeteer.
By owning the full web automation stack, we can go beyond performance, enabling features like native remote control, structured outputs tailored for LLMs, and deeper integration with AI agents.
## The road ahead[](#the-road-ahead)
Now backed by investors who understand the infrastructure demands emerging at the intersection of AI and the web, we’re accelerating development.
With this funding, we’ll grow our engineering team, expand browser coverage, and begin shipping features designed specifically for AI workflows.
“The current stack wasn’t built for what’s coming. Automation is no longer a niche use case, it’s becoming the primary driver of web traffic. That shift challenges our core assumptions and demands a new paradigm for how AI systems interact with the web.” — _Francis Bouvier, co-founder and CEO of Lightpanda_
## Investors[](#investors)
In addition to [ISAI](https://www.isai.fr/)  ([Jean-Patrice Anciaux](https://www.linkedin.com/in/jpanciaux/) ), [Kima](https://www.kimaventures.com/)  ([Alexis Robert](https://www.linkedin.com/in/robertalexis/) ), [Factorial Capital](https://www.factorialcap.com/)  ([Matt Hartman](https://www.linkedin.com/in/matthewforresthartman/) ) and [Prototype Capital](https://www.prototypecap.com/)  ([Andreas Klinger](https://www.linkedin.com/in/andreasklinger/) ), we’re proud to be supported by an impressive lineup of private investors, including:
* [Arthur Mensch](https://www.linkedin.com/in/arthur-mensch/)  (Mistral)
* [Julien Chaumond](https://www.linkedin.com/in/julienchaumond/)  and [Thomas Wolf](https://www.linkedin.com/in/thom-wolf/)  (Hugging Face)
* [Stanislas Polu](https://www.linkedin.com/in/spolu/)  and [Gabriel Hubert](https://www.linkedin.com/in/gabhubert/)  (Dust)
* [Mehdi Ghissassi](https://www.linkedin.com/in/mghissassi/)  (ex-Google Deepmind)
* [Matthieu Rouif](https://www.linkedin.com/in/matthieurouif/)  (Photoroom)
* [Benjamin Fabre](https://www.linkedin.com/in/benjaminfabre/)  (Datadome)
* [Sébastien Chopin](https://www.linkedin.com/in/atinux/) , [Kevin Cohen](https://www.linkedin.com/in/kevinc0hen/) , [Luc Delsalle](https://www.linkedin.com/in/lucdelsalle/) , [Thibaud Elzière](https://www.linkedin.com/in/thibaud-elziere/) , [Arnaud Ferreri](https://www.linkedin.com/in/arnaudferreri/) , [Yann Fleureau](https://www.linkedin.com/in/yann-fleureau-b1179983/) , [Anis Gandoura](https://www.linkedin.com/in/anis-gandoura/) , Emmanuel Gras, [Jérôme Joaug](https://www.linkedin.com/in/j%C3%A9rome-joaug-9149aa35/) , [Quentin Nickmans](https://www.linkedin.com/in/quentinnickmans/) , [Amaury Sepulchre](https://www.linkedin.com/in/amaurysepulchre/) , [Nicolas Steegmann](https://www.linkedin.com/in/steegmann/) , [Roxanne Varza](https://www.linkedin.com/in/roxannevarza/) 
## Get in touch[](#get-in-touch)
If you are working on web-based agents, extracting web data at scale, or designing systems that require reliable machine interaction with the web, [please reach out](mailto:hello@lightpanda.io).
You can try the browser via our [GitHub](https://github.com/lightpanda-io/browser) .
* * *
### Katie Brown
#### Cofounder & COO
Katie led the commercial team at BlueBoard, where she met Pierre and Francis. She rejoined them on the Lightpanda adventure to lead GTM and to keep the product closely aligned with what developers actually need. She also drives community efforts and, by popular vote, serves as chief sticker officer.

# [CDP Under the Hood: A Deep Dive](https://lightpanda.io/blog/posts/cdp-under-the-hood) 
 _https://lightpanda.io/blog/posts/cdp-under-the-hood_

### Pierre Tachoire
#### Cofounder & CTO
Friday, November 28, 2025
## TL;DR[](#tldr)
The Chrome DevTools Protocol (CDP) has become the de facto standard for browser automation, but it wasn’t designed for this purpose. Originally built as a debugging and inspection tool, CDP forces modern automation libraries into workarounds. Simple operations like clicking elements or extracting HTML require multiple unnecessary steps because CDP thinks in terms of pixels and rendering, not programmatic control.
## Built for Debugging, Not Automation[](#built-for-debugging-not-automation)
If you’re building automated web applications, you’ve probably worked with [Playwright](https://playwright.dev/) , [Puppeteer](https://pptr.dev/) , or newer tools like [Stagehand](https://www.stagehand.dev/)  and [Browser Use](https://github.com/browser-use/browser-use) . These libraries are used for testing, crawling and building web agents. And they’re all built on a protocol that was never meant for automation.
The [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)  (CDP) was designed to help developers debug browser behavior, not to control browsers programmatically. This architectural mismatch creates performance bottlenecks, unnecessary complexity, and forces every automation library to reinvent the wheel.
CDP offers 650 commands across 200 types. It gives you deep access to Chrome’s internals. From high level commands like , to low level ones like , .
This flexibility might sound good in theory, but it actually creates a critical problem in practice when you implement the protocol like Lightpanda: there’s no standardized way to do anything. Each automation library interprets CDP differently, leading to unexpected behavior across tools.
The protocol includes domains like:
* **Page:** For navigating
* **DOM:** For querying and manipulating the document object model
* **Runtime:** For evaluating JavaScript in the page context
* **Input:** For sending user interactions
* **Network:** For inspecting HTTP requests
* **Fetch:** For intercepting and modifying HTTP requests
These domains weren’t architected with automation workflows in mind. They were built to support Chrome DevTools, where a human developer clicks through a GUI to inspect elements, set breakpoints, and trace network requests.
Let’s take a straightforward example: getting the full HTML content of a page. This is basic for every web crawler and testing framework.
### The “Pure” CDP Approach[](#the-pure-cdp-approach)
Following CDP’s domain structure, you’d use to get the document reference, then to extract content. Two calls, clean domain separation. But here’s where theory meets reality.
### How Automation Libraries Actually Do It[](#how-automation-libraries-actually-do-it)
Every major automation library avoids this approach. Why? Because the DOM domain is computationally expensive and memory-intensive. It was optimized for debugging scenarios where you’re inspecting specific elements, not bulk extraction.
#### Puppeteer’s Approach[](#puppeteers-approach)
Puppeteer uses to inject JavaScript directly in the page context. It accesses the root element with directly and uses for HTML document:
This bypasses the CDP DOM domain entirely.
#### Playwright’s Approach[](#playwrights-approach)
Playwright uses a similar plain JavaScript approach with an utility script to run get the and apply .
#### Chromedp’s Approach[](#chromedps-approach)
The Go library [Chromedp](https://github.com/chromedp/chromedp)  combines a high level with the low level :
#### Rod’s Approach[](#rods-approach)
The [go-rod/rod](https://github.com/go-rod/rod)  library uses a mix of different approaches too, plain JS to retrieve the window and high level :
### What They All Have in Common: Nobody Uses the DOM Domain[](#what-they-all-have-in-common-nobody-uses-the-dom-domain)
Following the protocol’s domain structure, the “proper” way to extract HTML would be to use followed by .
But all four CDP-based libraries avoid the DOM domain for the actual HTML extraction. Puppeteer, Playwright, chromedp, and Rod all ultimately rely on or to execute JavaScript directly in the page context.
This consistent pattern is due to performance.
The DOM domain is computationally heavy and memory-intensive. This isn’t a bug, it’s because the DOM domain was built primarily for debugging scenarios where developers need to inspect element hierarchies, set breakpoints on DOM mutations, and analyze the document structure interactively. It maintains rich metadata and object representations that are invaluable for debugging but unnecessary overhead for automation tasks like extracting HTML.
This [GitHub issue on the Puppeteer project](https://github.com/puppeteer/puppeteer/issues/2936)  illustrates the problem: developers consistently report that DOM domain operations are significantly slower than Runtime-based JavaScript injection for bulk operations.
So while would be the more “logical” approach from a protocol design perspective, the reality of production automation has driven every major library toward the same pragmatic solution: inject JavaScript, run it in the browser’s native context, and return the results. It’s faster, uses less memory, and gets the job done.
## Example 2: The Coordinate Problem[](#example-2-the-coordinate-problem)
CDP’s rendering-centric approach is apparent if we look at the example of what happens across libraries when you want to click a link:
With Puppeteer:
With Playwright:
This might seem clean, semantic and developer-friendly because you’re telling the browser “click this element” in terms that match how you think about the DOM.
### What Actually Happens[](#what-actually-happens)
DP doesn’t have a command to click an element directly. Instead, every click operation transforms into a three-step coordinate-based process:
1. Find the element’s coordinates on the rendered page
2. Move the mouse to those coordinates using
3. Dispatch a click event at that location
### Why This Architecture Is Wrong for Automation[](#why-this-architecture-is-wrong-for-automation)
You wanted to interact with a DOM element, but CDP forced you through the rendering layer.
This creates several problems:
* **Unnecessary transformations:** Converting from DOM elements to pixel coordinates and back is pure overhead
* **Race conditions:** The element might move between getting coordinates and clicking
* **Viewport dependencies:** Coordinates only make sense in the context of the current scroll position
* **Multiple round trips:** Each step requires a separate network call to the browser
This architecture exists because Chrome was built for humans who need to see pixels on a screen. When you’re debugging, you click where you see things and the rendering engine is the source of truth.
However, we believe that for automation, the DOM is the source of truth and rendering is an implementation detail you shouldn’t need to think about.
### Why This Matters for AI and Machine Web Interaction[](#why-this-matters-for-ai-and-machine-web-interaction)
Modern web automation isn’t just about testing. AI agents are navigating websites to accomplish tasks. Large-scale data extraction systems are processing millions of pages. Browser-based automation is becoming core infrastructure.
These use cases need efficiency and semantic clarity, not debugging tools retrofitted for automation. When your AI agent needs to interact with thousands of pages, it can gain efficiency by removing unnecessary calls back and forth that create friction in machine driven workflows.
### How We Handle Coordinates in Lightpanda[](#how-we-handle-coordinates-in-lightpanda)
Lightpanda doesn’t have a graphical rendering engine calculating pixel positions. But CDP commands expect coordinates, so how do we handle click operations?
Instead of forcing everything through the rendering layer, we use on-demand flat rendering. The automation client can request a flat, semantic representation of the page only when needed, rather than constantly translating between DOM and pixel coordinates.
Here’s how it works:
1. When a client requests coordinates for an element for the first time, we add that element to a simple list in our flat renderer
2. We return the element’s position in that list as its “coordinates”
3. When the client clicks on those coordinates, we look up the element directly in the flat renderer’s list
The coordinates don’t represent the actual pixel position of an element on a rendered page, they’re simply an identifier. The result is we achieve CDP compatibility without needing to rely on graphical rendering:
## The Path Forward[](#the-path-forward)
The Chrome DevTools Protocol isn’t broken. It’s an excellent debugging tool that does exactly what it was designed to do. But as browser automation evolves from an occasional testing task to core infrastructure, CDP’s limitations become harder to ignore.
The fundamental issue is architectural intent. CDP was built for human developers who need to see, inspect, and understand what’s happening in a browser. Automation needs semantic, programmatic control of the DOM.
The fragmentation across automation libraries isn’t a failure of those tools. It’s a natural consequence of adapting a debugging protocol for automation. Each library makes different tradeoffs because CDP doesn’t provide a clear path forward.
The coordinate-based clicking, the multiple HTML extraction strategies, and the performance overhead aren’t bugs. They’re features of a protocol solving a different problem.
The question isn’t whether CDP works. It does. The question is whether we can build something better when automation is the primary goal from day one.
* [Explore Lightpanda’s approach](https://lightpanda.io/docs/quickstart/installation-and-setup)  to browser automation
* [Try our open-source browser](https://github.com/lightpanda-io/browser)  built for machines and AI workflows
* [Get in touch](mailto:hello@lightpanda.io) and share your experiences with CDP in production
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Posts Tagged with “tls”](https://lightpanda.io/blog/tags/tls) 
 _https://lightpanda.io/blog/tags/tls_

 Posts Tagged with “tls” 
[logo](/)
* [Cloud offer](https://lightpanda.io/#cloud-offer)
* [Docs](https://lightpanda.io/docs)
* [Blog](https://lightpanda.io/blog)
* [Jobs](https://lightpanda.io/jobs)
* [IconDiscord](https://discord.gg/K63XeymfB5)
 
* [
 
 GithubLogo
 
 ](https://github.com/lightpanda-io/browser)
* [Log In](https://console.lightpanda.io/login)[Sign Up](https://console.lightpanda.io/signup)
 
Toggle navigation
CTRL K
# Posts Tagged with “tls”
## [Lightpanda browser now uses libcurl](/blog/posts/lightpanda-browser-now-uses-libcurl)
We've switched all Lightpanda browser HTTP requests from our home made Zig HTTP client + zig.tls) to libcurl[Read More →](/blog/posts/lightpanda-browser-now-uses-libcurl)
Wed Jul 16 2025
SVG
[logo](/)
Copyright © 2026 Lightpanda - All rights reserved - [RSS](/blog/rss.xml)Built with [Nextra](https://nextra.site)
[IconLinkedin](https://www.linkedin.com/company/102175668)[IconX](https://x.com/lightpanda_io)[IconDiscord](https://discord.gg/K63XeymfB5)[IconGithub](https://github.com/lightpanda-io/browser)

# [Your first test - Documentation | Lightpanda](https://lightpanda.io/docs/quickstart/your-first-test) 
 _https://lightpanda.io/docs/quickstart/your-first-test_

Lightpanda is a headless browser built from scratch. Unlike Headless Chrome, it has no UI or graphical rendering for humans, which allows it to start instantly and execute pages up to 10x faster.
Unlike [curl](https://curl.se/) , which only fetches raw HTML, Lightpanda can execute JavaScript and run query selectors directly in the browser.
It’s ideal for crawling, testing, and running AI agents that need to interact with dynamic web pages, and it’s fully compatible with libraries like [Puppeteer](https://pptr.dev/)  and [Playwright](https://playwright.dev/) .
In this example, you’ll connect cd CDP client, [Puppeteer](https://pptr.dev/)  or [Playwright](https://playwright.dev/)  to Lightpanda and extract all reference links from a [Wikipedia page](https://www.wikipedia.org/) .
## Connect CDP Client to Lightpanda[](#connect-cdp-client-to-lightpanda)
Install the [`puppeteer-core`](https://www.npmjs.com/package/puppeteer-core) _or_ [`playwright-core`](https://www.npmjs.com/package/playwright-core) npm package.
Unlike `puppeteer` and `playwright` npm packages, `puppeteer-core` and `playwright-core` don’t download a Chromium browser.
### puppeteer
 npm install -save puppeteer-core
Edit your `index.js` to connect to Lightpanda:
### puppeteer
 'use strict'
 
 import { lightpanda } from '@lightpanda/browser';
 import puppeteer from 'puppeteer-core';
 
 const lpdopts = {
 host: '127.0.0.1',
 port: 9222,
 };
 
 const puppeteeropts = {
 browserWSEndpoint: 'ws://' + lpdopts.host + ':' + lpdopts.port,
 };
 
 (async () => {
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 
 // Connect Puppeteer to the browser.
 const browser = await puppeteer.connect(puppeteeropts);
 const context = await browser.createBrowserContext();
 const page = await context.newPage();
 
 // Do your magic ✨
 console.log("CDP connection is working");
 
 // Disconnect Puppeteer.
 await page.close();
 await context.close();
 await browser.disconnect();
 
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
 })();
Run the script to test the connection between Puppeteer or Playwright and Lightpanda:
 $ node index.js
 🐼 Running Lightpanda's CDP server... { pid: 31371 }
 CDP connection is working
## Extract all reference links from Wikipedia[](#extract-all-reference-links-from-wikipedia)
Update `index.js` using `page.goto` to navigate to a Wikipedia page and extract all the reference links:
### puppeteer
 // Go to Wikipedia page.
 await page.goto("https://en.wikipedia.org/wiki/Web_browser");
Execute a query selector on the browser to extract the links:
### puppeteer
 // Extract all links from the references list of the page.
 const reflist = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('.references a.external')).map(row => {
 return row.getAttribute('href');
 });
 });
Here’s the full `index.js` file:
### puppeteer
 'use strict'
 
 import { lightpanda } from '@lightpanda/browser';
 import puppeteer from 'puppeteer-core';
 
 const lpdopts = {
 host: '127.0.0.1',
 port: 9222,
 };
 
 const puppeteeropts = {
 browserWSEndpoint: 'ws://' + lpdopts.host + ':' + lpdopts.port,
 };
 
 (async () => {
 // Start Lightpanda browser in a separate process.
 const proc = await lightpanda.serve(lpdopts);
 
 // Connect Puppeteer to the browser.
 const browser = await puppeteer.connect(puppeteeropts);
 const context = await browser.createBrowserContext();
 const page = await context.newPage();
 
 // Go to Wikipedia page.
 await page.goto("https://en.wikipedia.org/wiki/Web_browser");
 
 // Extract all links from the references list of the page.
 const reflist = await page.evaluate(() => {
 return Array.from(document.querySelectorAll('.references a.external')).map(row => {
 return row.getAttribute('href');
 });
 });
 
 // Display the result.
 console.log("all reference links", reflist);
 
 // Disconnect Puppeteer.
 await page.close();
 await context.close();
 await browser.disconnect();
 
 // Stop Lightpanda browser process.
 proc.stdout.destroy();
 proc.stderr.destroy();
 proc.kill();
 })();
## Execute the link extraction[](#execute-the-link-extraction)
Execute index.js to see the links directly in your console:
 $ node index.js
 🐼 Running Lightpanda's CDP server... { pid: 34389 }
 all reference links [
 'https://gs.statcounter.com/browser-market-share',
 'https://radar.cloudflare.com/reports/browser-market-share-2024-q1',
 'https://web.archive.org/web/20240523140912/https://www.internetworldstats.com/stats.htm',
 'https://www.internetworldstats.com/stats.htm',
 'https://www.reference.com/humanities-culture/purpose-browser-e61874e41999ede',
### Step 3: [Extract data](https://lightpanda.io/docs/quickstart/build-your-first-extraction-script)[](#step-3-extract-data)

# [CDP vs Playwright vs Puppeteer: Is This the Wrong Question?](https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question) 
 _https://lightpanda.io/blog/posts/cdp-vs-playwright-vs-puppeteer-is-this-the-wrong-question_

### Pierre Tachoire
#### Cofounder & CTO
## TL;DR[](#tldr)
When choosing browser automation tools, developers often compare Playwright and Puppeteer as if they’re equivalent options. But Chrome DevTools Protocol (CDP) sits beneath most of these tools as the actual control mechanism. Understanding this relationship helps you make better architectural decisions and potentially skip the abstraction layer entirely.
[Chrome DevTools Protocol (CDP)](https://chromedevtools.github.io/devtools-protocol/)  is a low-level interface that lets programs control Chromium-based browsers programmatically. When you open Chrome’s DevTools in your browser, you’re actually using CDP under the hood, the same protocol that powers headless automation.
CDP provides direct access to browser internals through WebSocket connections. You can create browser contexts, navigate pages, fill forms, click elements, monitor network traffic, and hundreds of other operations. The protocol exposes around 300+ commands organized into domains like Page, Network, DOM, and Runtime.
The browser responds with structured JSON data. Every action you take in browser automation ultimately translates to these CDP commands.
### Why CDP Matters for Automation[](#why-cdp-matters-for-automation)
CDP was designed for multiple purposes: debugging, profiling, inspecting, and controlling browsers. This broad scope means you can often accomplish the same task in different ways. To click a button you could use the CDP command, or you could execute JavaScript directly with to call .
This flexibility makes complete CDP compatibility across different clients more challenging. Each implementation makes choices about which commands to use and how to handle edge cases.
## The Abstraction Layers: Puppeteer and Playwright[](#the-abstraction-layers-puppeteer-and-playwright)
[Puppeteer](https://pptr.dev/)  and [Playwright](https://playwright.dev/)  are higher-level frameworks that use CDP underneath to provide friendlier APIs. You write cleaner code, they handle the CDP plumbing.
### Puppeteer: Google’s Official CDP Client[](#puppeteer-googles-official-cdp-client)
Puppeteer came first, released by Google’s Chrome team in 2017. It provides a Node.js API directly on top of CDP, staying close to the protocol’s native commands.
When you run this, here’s what happens:
Puppeteer’s design philosophy favors native CDP commands over JavaScript injection. When you call , it typically uses CDP’s rather than executing in the page context. This makes it faster but sometimes more brittle with complex UI interactions.
### Playwright: Microsoft’s Answer[](#playwright-microsofts-answer)
Microsoft released **Playwright** in 2020, built by some of the original Puppeteer team. They had a specific goal: support Firefox and WebKit alongside Chromium while maintaining a consistent API.
The API looks similar, but under the hood, Playwright makes different tradeoffs. To ensure compatibility across Firefox (which uses a different protocol) and WebKit, Playwright relies more heavily on JavaScript execution within the page context rather than browser-specific protocol commands.
The result is 11KB of websocket messages are exchanged between Puppeteer and the browser, while Playwright uses 326KB.
### Performance: Puppeteer vs Playwright[](#performance-puppeteer-vs-playwright)
In our testing with identical scraping tasks, Puppeteer consistently runs 15-20% faster than Playwright when both target Chromium. The performance gap comes from those architectural choices. Native CDP commands execute faster than JavaScript injection.
Here’s a rough breakdown:
* **Puppeteer**: More native CDP usage → fewer context switches → faster execution
* **Playwright**: More JavaScript execution → better cross-browser compatibility → slightly slower on Chromium
For most applications, this difference won’t matter. Where it shows up is high-volume automation running thousands of sessions daily. At that scale, 15-20% compounds quickly.
## Beyond Node.js: CDP Clients in Other Languages[](#beyond-nodejs-cdp-clients-in-other-languages)
The CDP ecosystem extends far beyond JavaScript. Since CDP communicates over WebSocket with JSON messages, any language can implement a client.
[chromedp](https://github.com/chromedp/chromedp)  (Go) provides a fast, idiomatic Go interface to CDP. It’s popular for building high-performance automation services.
[chromiumoxide](https://github.com/mattsse/chromiumoxide)  (Rust) brings CDP to Rust with async/await support. We’ve used it for building system-level automation tools where memory safety matters.
Python developers have options too. [pyppeteer](https://github.com/pyppeteer/pyppeteer)  ports Puppeteer to Python (though it’s less actively maintained now), while [playwright-python](https://playwright.dev/python/docs/library)  offers official Playwright support with excellent async/await integration.
The Chrome DevTools team maintains a awesome list of CDP clients at [github.com/ChromeDevTools/awesome-chrome-devtools](https://github.com/ChromeDevTools/awesome-chrome-devtools) . You’ll find implementations in Java, C#, Ruby, and more esoteric languages.
## Lightpanda: Rethinking Browser Automation[](#lightpanda-rethinking-browser-automation)
What if you could use CDP directly with a faster engine?
[Lightpanda](https://lightpanda.io/)  implements a CDP server without the graphical rendering overhead of Chrome. It handles the commands that matter for automation: navigation, JavaScript execution, DOM manipulation, network interception.
Lightpanda optimizes:
* **Images**: Ignored
* **Fonts**: Not downloaded or rendered
* **CSS**: Ignored
When you’re scraping data or running automated tests, you don’t actually need pixel-perfect rendering. You need the DOM, JavaScript execution, and network responses.
The compatibility story matters here. Since Lightpanda implements a CDP server, your existing Puppeteer and Playwright scripts work with minimal changes. You’re not rewriting automation code, you’re swapping the browser endpoint.
### Why Skip Rendering?[](#why-skip-rendering)
Rendering is expensive. When Chrome processes a page:
1. Parse HTML → Build DOM tree (needed for automation)
2. Parse CSS → Build CSSOM tree (not needed for most automation)
3. Combine into render tree (not needed)
4. Layout calculation (not needed)
5. Paint pixels (not needed)
6. Composite layers (not needed)
Steps 2-6 consume significant CPU, memory, and network bandwidth. Fonts alone can add megabytes per page. Complex CSS animations peg CPU cores. None of this helps you fill a form or extract data.
By skipping these steps, Lightpanda dramatically reduces:
* **Memory usage**: No framebuffers, no texture caches
* **Network bandwidth**: No image/font downloads
* **CPU time**: No layout calculations or painting
We’ve seen automation tasks run 3-5x faster with Lightpanda compared to Headless Chrome for data extraction workflows. Your mileage varies based on page complexity, but the principle holds: don’t render what you don’t need.
We believe we should stop asking “Puppeteer or Playwright?” and start asking “What layer of abstraction matches my problem?”
Here’s the decision tree that actually matters:
**Running thousands of automation jobs daily?** You need speed. Puppeteer’s native CDP approach andLightpanda’s rendering-free engine will save you compute hours and real money.
**Building something that doesn’t exist yet?** Drop down to raw CDP. Yes, it’s more work. But when you need custom network interception or novel browser control patterns, the abstraction layers become constraints. This is the choice made by Browser-use and Stagehand.
**Just need to scrape some data?** Lightpanda with Puppeteer gives you the best of both worlds: familiar APIs, brutal efficiency.
**Lightpanda is not yet compatible with your target?** Switch to Chrome without changing your script.
CDP isn’t competing with Puppeteer or Playwright. It’s the foundation they’re built on. Understanding that relationship transforms your architecture decisions from “which tool is better?” to “which abstraction level solves my specific problem?”
## Go Deeper[](#go-deeper)
Try Lightpanda out to see what a faster, CDP-compatible browser feels like in practice, start here:
* [Quickstart Guide](https://lightpanda.io/docs/quickstart/installation-and-setup) : get started with Lightpanda in under ten minutes
* [Repo GitHub](https://github.com/lightpanda-io/browser) : check out the open source project, run your first session, and kick the tires
* Read the docs on CDP compatibility
 * [Puppeteer](https://lightpanda.io/docs/open-source/usage#connect-with-puppeteer) 
 * [Playwright](https://lightpanda.io/docs/open-source/usage#connect-with-playwright) 
* [Create an API key](https://console.lightpanda.io/signup)  to test Lightpanda’s cloud offer for free
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

# [Browser security in the age of AI agents](https://lightpanda.io/blog/posts/browser-security-in-the-age-of-ai-agents) 
 _https://lightpanda.io/blog/posts/browser-security-in-the-age-of-ai-agents_

### Pierre Tachoire
#### Cofounder & CTO
Last week, [Brave exposed security risks in Comet](https://brave.com/blog/comet-prompt-injection/) , Perplexity’s AI browser.
TLDR: giving an LLM direct access to a user-facing browser is dangerous. The model can see everything you see and take actions on your behalf. It can be tricked by malicious content, leak information and take unexpected actions.
This is not a thought experiment, it’s happening.
Brave’s approach allows the LLM to access data across tabs, creating a high risk scenario. Defenses like in-model guardrails can reduce risk but cannot guarantee safety, because a single malicious prompt could bypass them.
As observers noted in the [Hackernews thread](https://news.ycombinator.com/item?id=45004846) , this is not like a human making a mistake. LLMs can be attacked relentlessly, and their design fundamentally allows unpredictable execution of input. Limiting permissions or approved actions helps, but it cannot fully eliminate the possibility of catastrophic breaches, making this approach inherently unsafe.
## The lethal trifecta[](#the-lethal-trifecta)
Simon Willison’s [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)  explains that the second an LLM system has 1) exposure to untrusted content, 2) access to private data, and 3) the ability to communicate externally, it can become malicious.
There is a structural problem when you apply this in the context of browser agents.
1. Exposure to untrusted content: give a model access to the web and you are exposed
2. Access to private data: let your agent interact with your sessions and you are exposed
3. The ability to communicate externally: let your agent take actions on the web and you are exposed
The reality is that the more capable your AI agent is, the more dangerous it becomes if it touches the web directly.
## Isolating the browser is not enough[](#isolating-the-browser-is-not-enough)
All the current approaches, whether user facing or headless, are forks of the Chromium project, designed for human users.
You can give an agent a dedicated browser instance in a sandbox, which reduces risk, but it does not remove it. Using Chromium forces you to implement restrictions around the browser: limiting what it can do, controlling what it can access, and monitoring its actions. Every feature, extension, and hidden API in the Chromium stack increases the attack surface, making it fundamentally harder to provide safety guarantees.
By contrast, building a browser from scratch allows you to enforce these constraints inside the browser itself. You can design it to only do what you authorize, limit exposure to untrusted content, and tightly control access to private data.
## How do you give an LLM a browser without giving it everything?[](#how-do-you-give-an-llm-a-browser-without-giving-it-everything)
Cut any leg of the lethal trifecta and you remove the risk.
The answer [Simon Willison proposes](https://simonwillison.net/2023/Apr/25/dual-llm-pattern/#dual-llms-privileged-and-quarantined)  is to split tasks across multiple LLMs. An isolated LLM handles individual tasks, and a main model orchestrates them without seeing external content. In the middle sits a controller without LLM reasoning that manages data safely.
We believe you can integrate controls into the browser itself. The browser should only do what you authorize, limiting exposure to content, the ability to act outside itself and access to private data.
That is why we built a lightweight browser from the ground up. It is fast, and crucially, it is small. Small means it can run locally, close to the agent, and only when needed. You do not have to trust a cloud provider or run a full desktop browser.
We’re building Lightpanda for AI agents first, not retrofitted from a traditional browser. A lightweight browser with instant startup changes the way you can use it.
Instead of having multiple tabs in Chrome, you can start an instance of Lightpanda per task and reduce its privileges to your immediate needs: read only on this domain for the first step, act only for the second.
## Our vision: one browser, one task[](#our-vision-one-browser-one-task)
Lightpanda aims to provide the most secure foundation possible by letting agents operate closer to the machine. That way, agents can be sandboxed per task and scale safely in the cloud or on a workstation without exposing your data or machine.
Our vision is simple: one browser, one task. Each agent has its own browsers, and each browser instance handles only a single task. Browsers are isolated to the minimal scope they need to complete their work.
There is no single silver bullet for securing agents. Designing the browser from the ground up is a step that makes that goal more achievable.
* * *
### Pierre Tachoire
#### Cofounder & CTO
Pierre has more than twenty years of software engineering experience, including many years spent dealing with browser quirks, fingerprinting, and scraping performance. He led engineering at BlueBoard with Francis and saw the same issues first hand when building automation on top of traditional browsers. He also runs Clermont'ech, a community where local engineers share ideas and projects.

