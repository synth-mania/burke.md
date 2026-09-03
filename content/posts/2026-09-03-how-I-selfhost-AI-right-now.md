# how I selfhost AI right now

Aside from currently pursuing a bachelor's degree in AI, I'm also a home-labbing enthusiast.

A homelab is, as someone on reddit so eloquently put it:

>   project space for nerd shit
>   workbench but for computer
>   art studio but for networks 

https://www.reddit.com/r/homelab/comments/1tnjt5d/comment/onug4hm

Unsurprisingly, there is a [vibrant community](https://reddit.com/r/LocalLlama/) at this intersection. I am an active participant here. It contains a fair share of people flexing rigs worth more than your car, but also a wealth of wisdom. 

I learned so much here, and it's still the place that I go to get first impressions on new models and other fresh developments in the LLM space.

## how I deal with the rapid rate of change in self hosted AI

Like with most areas in live, if you dig enough, you'll realize that there is virtually no end to the optimizations that can be made to a local LLM hosting setup. From the specific model / quant that you're using, to inference settings, your inference engine, and even operating system. Premature optimization is something to be avoided, and at the pace that this field is progressing I don't think it's usually worth it (from a utilitarian perspective -- doing it for fun is something else) to spend forever dialing in your specific inference setup for a specific model.

For this reason, it is usually only every month or so that I check in and review new model releases, and less often than that that I actually take the time to upgrade my current setup. Like phones, I think it's more likely that as locally-hostable models get better and better I will feel a decreasing pressure to upgrade with every subsequent generation, as we eventually hit diminishing returns. I don't know if we're there yet, and we certainly aren't if there is a similar jump from Qwen3.8 -> Qwen4 as there was from Qwen3.6 -> Qwen3.8, but I think we're starting to reach the skill floor where each upgrade is less necessary than the last.

Simply put, I try to not be constantly looking for the greatest model or the fastest setup in the world. What I have right now works, and it works incredibly well for what I need it to.

## my current setup

I'll drag this on no longer. If you're reading this shortly after upload, you'll be unsurprised to hear that I'm using **Qwen3.8-27b** for the bulk of my work locally. I was also very impressed with Laguna S 2.1 for software development, but with only a single inference rig right now, it doesn't make sense to pick more than one daily driver.

In the world of self hosted AI, this is a somewhat plain setup. According to Huggingface's hardware poll, it's perhaps the second most common in the community.

This is my rig:

- **1x RTX 3090** gpu
- 64gb DDR4 ram
- Ryzen 9 5950x cpu
(the cpu + ram are virtually unutilized for inference with this particular model, but come in handy for larger ones like Laguna)

At a Q4_K_S quantization and Q8 KV cache, Qwen3.8-27b can fit entirely in VRAM with a 150k token context.

My inference provider is LM Studio, which doesn't have the bleeding edge of optimizations, but is reliable and convenient. In particular, I like the `lms` command-line utility, which allows me to remotely control the inference server it runs on my desktop.

Harnessing the intelligence of this model for me is [pi-agent](https://pi.dev/). It's a minimalist project, the whole MO is that it comes with a small feature set, but is easy to extend. I like that freedom. For me, it's been configured with plugins to access web search, my self hosted calendar and task tracker, my grocery list, and with limited access to my email. For me, this means **I have finally reached the point where I don't feel any pressure to use cloud models**, and I'm shocked that I can say that in 2026.

[pi-web](https://pi-web.dev/) is a community maintained webui that I use on top of pi-agent. It enables access to one pi-agent install in the homelab, from any device on my network. [Tailscale](https://tailscale.com) extends my home network securely over the internet, letting me take pi-agent with my everywhere on my phone and laptop.

Text me with plans? I'll screenshot that and send it to pi-agent. It'll be added to my calendar with no extra effort. One of my whitelisted contacts emails word of an event on campus? Before I even check my university inbox, I'll see it on my calendar.

This feels like a hint of what we all imagined a few years ago when we thought of the world after AI. It's reminiscent of Iron Man's Jarvis, but handles tasks of a much more mundane nature. There's still a great deal of utility in that for me, though. It's the mundane stuff that used to get me. My naturally poor tendencies to manage my time and schedule effectively were a burden on myself and others in my life, but by reducing the "cost of entry" to simply having an accurate calendar, I am much more organized now.

I might publish a youtube video showcasing the setup in more detail someday, but I think most of the value is in finding a system customized for *you*, that assists the menial digital tasks that you dread the most.
