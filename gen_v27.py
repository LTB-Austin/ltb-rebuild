# -*- coding: utf-8 -*-
import re, html

SITE = "/sessions/epic-fervent-franklin/mnt/outputs/v27work"

# name, slug, headshot, color, role(formal), tagline(fun), location, linkedin(raw or None), email or None, about
TEAM = [
 ("Alex Gelbert","alex-gelbert","headshot-01.png","ph-mint","Founder & CEO",
  "Our longtime visionary — leading everything from strategy to new product development to client partnerships.",
  "Denver, CO, United States",
  "https://www.linkedin.com/in/alexgelbert?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAAs6EJwBVBc9PE89f9EdMGiA2cKRnEP-8QI&lipi=urn",
  "alex@lettherebe.com",
  "Alex is the Founder & CEO of Let There Be — and in practice, that means he's involved in just about everything. From creative strategy to sales, he's hands-on at every level of the company, boots-on-the-ground at conferences, and the face of the brand. Multi-talented, deeply invested, and always in the mix."),
 ("Matthew Matlin","matthew-matlin","headshot-12.png","ph-sky","Creative Director",
  "Shapes the creative direction of every video we make.",
  "Montreal, QC, Canada",
  "https://www.linkedin.com/in/matthewmatlin?miniProfileUrn=x",
  "matthew@lettherebe.com",
  "Matthew is Let There Be's Creative Director — and a genuinely hip one at that. With a background in film and live-action directing, he brings a cinematic sensibility to everything he touches. He's constantly pushing the company's creative boundaries and leading some of its most ambitious work."),
 ("Austin Miller","austin-miller","headshot-05.png","ph-coral","Content & AI Strategist",
  "Merges strategy, research, and creative to build Science Stories.",
  "Minneapolis, MN, United States", None, "austin@lettherebe.com",
  "Austin comes from a copywriting background and has evolved into one of the team's most versatile contributors — spanning writing, creative, strategy, and AI. He's been a driving force in positioning Let There Be for the future, helping the company think and communicate more sharply."),
 ("Brad Eason","brad-eason","headshot-04.png","ph-purple","Sr. Account Manager",
  "Catches the small details that make a video perfect.",
  "Dallas, TX, United States",
  "https://www.linkedin.com/in/braddock-eas1?miniProfileUrn=x",
  "brad@lettherebe.com",
  "Brad is a steady, patient leader who keeps projects and people on track. As a Senior Account Manager, he leads both client engagements and a team of account managers — setting a high standard for the department and the company through years of experience and genuine care."),
 ("Lauryn Giannace","lauryn-giannace","headshot-13.png","ph-yellow","Account Manager",
  "Creates order from chaos and keeps every project on track.",
  "Toronto, ON, Canada",
  "https://www.linkedin.com/in/lauryngiannace?miniProfileUrn=x",
  "lauryn@lettherebe.com",
  "Lauryn is a natural account manager — organized, thoughtful, and a genuine pleasure to work with. She keeps clients feeling supported and projects moving forward, bringing a calm and capable presence to every engagement."),
 ("Giselle Ghaffari","giselle-ghaffari","headshot-03.png","ph-mint","Account Manager",
  "Connects the dots between teams and clients.",
  "Toronto, ON, Canada",
  "https://www.linkedin.com/in/giselle-ghaffari?miniProfileUrn=x",
  "giselle@lettherebe.com",
  "Giselle is an Account Manager who brings a rare depth to the role. Well-traveled, well-spoken, and incredibly kind, she has a natural intelligence and patience that makes every client interaction feel thoughtful and substantive. A standout member of the team."),
 ("Nate Bundy","nate-bundy","headshot-15.png","ph-sky","Account Manager",
  "Keeps projects moving and clients smiling.",
  "Dallas, TX, United States",
  "https://www.linkedin.com/in/nathan-bundy-20574b3b0?miniProfileUrn=x",
  "nate@lettherebe.com",
  "Nate is the kind of account manager clients love — a classic Texas gentleman who's warm, family-oriented, and genuinely excited about the work. He's organized, tech-forward, and brings a grounded energy that makes him a great person to have in your corner."),
 ("Alexa Mastrogiacomo","alexa-mastrogiacomo","headshot-16.png","ph-coral","Account Manager",
  "Brings clarity to every project she touches.",
  "Toronto, ON, Canada",
  "https://www.linkedin.com/in/alexa-mastrogiacomo-409602289?miniProfileUrn=x",
  "alexa@lettherebe.com",
  "Alexa is an Account Manager who lights up every room she walks into. Her warmth, constant smile, and gift for communication make clients feel genuinely at ease — and that's an invaluable trait. She's a natural at building relationships and making people feel seen."),
 ("Louis Dubois","louis-dubois","headshot-14.png","ph-purple","Lead 2D Animator",
  "Shows complex concepts simply — in 2D and 3D.",
  "Montreal, QC, Canada", None, "louis@lettherebe.com",
  "Louie is one of Let There Be's longest-tenured team members — nearly a decade in — and it shows. A Lead 2D Animator who also moves fluidly into 3D and creative direction, he helped shape the company's rebrand and continues to be one of its most versatile and respected creatives. A genuine artist inside and outside of work."),
 ("Ana Mortari","ana-mortari","headshot-08.png","ph-yellow","Illustrator & 2D Animator",
  "Brings ideas to life through illustration and animation.",
  "Chapecó, SC, Brazil", None, "anaxandra@lettherebe.com",
  "Anaxandra brings a vibrant Brazilian spirit to everything she creates. A talented 2D animator and creative director, she's been with Let There Be for years and brings infectious energy, sharp instincts, and a rare combination of artistic range and warmth to the team."),
 ("Marie-Maxime Giguere","marie-maxime-giguere","headshot-02.png","ph-mint","Illustrator & 2D Animator",
  "Synthesizes ideas into beautifully crafted videos.",
  "Montreal, QC, Canada",
  "https://www.linkedin.com/in/marie-maxime-g-827b33117?miniProfileUrn=x",
  "marie-maxime@lettherebe.com",
  "Marie-Maxime is a multi-disciplinary creative with a long history at Let There Be. An illustrator, 2D animator, graphic designer, and gifted sketch artist, she brings warmth, humor, and serious craft to every project. Her character work is some of the best on the team."),
 ("Josh Ireland","josh-ireland","headshot-09.png","ph-sky","Lead 3D Animator",
  "Builds the dimensional worlds our science lives in.",
  "Guelph, ON, Canada",
  "https://www.linkedin.com/in/joshua-ireland-47217ab6?miniProfileUrn=x",
  None,
  "Josh is a Lead 3D Animator with a gift for world-building. His work goes beyond motion — he constructs intricate, immersive environments that bring science to life in ways that feel entirely cinematic. A longtime member of the team and a true craftsman."),
 ("Julide Cakiroglu","julide-cakiroglu","headshot-11.png","ph-coral","Illustrator & 2D Animator",
  "Motion with precision, frame by frame.",
  "London, ON, Canada", None, None,
  "Julide is a skilled 2D animator and illustrator with an eye for character and detail. Her work reflects a deeply artistic background — creative, expressive, and full of personality. She brings a distinct visual sensibility to every project she touches."),
 ("Lindsey Polevoy","lindsey-polevoy","headshot-06.png","ph-purple","Copywriter & Account Coordinator",
  "Finds the story in the most unexpected places.",
  "Los Angeles, CA, USA",
  "https://www.linkedin.com/in/lindseypolevoy?miniProfileUrn=x",
  "lindsey@lettherebe.com",
  "Lindsey is a Copywriter and Account Coordinator with a strong advertising background and a real talent for creative communication. She's organized, inventive, and deeply in tune with what Let There Be does — always finding sharper, more compelling ways to tell the story of science."),
 ("Alexander Fabian","alexander-fabian","headshot-10.png","ph-yellow","Business Development",
  "Builds the connections that keep opportunities moving.",
  "Ithaca, NY, United States",
  "https://www.linkedin.com/in/alexander-fabian-2434044b?miniProfileUrn=x",
  "alexander@lettherebe.com",
  "Alexander is the engine behind Let There Be's business development efforts. Equal parts organized and hilarious to be around, he's the guy who keeps the sales machine running — setting up clients, coordinating conferences, and making sure Alex and the team are always set up for success."),
 ("Shivaya Urcuyo","shivaya-urcuyo","headshot-07.png","ph-mint","Executive Assistant",
  "Keeps the engine running on time.",
  "Boulder, CO",
  "https://www.linkedin.com/in/shivayaurcuyo?miniProfileUrn=x",
  "shivaya@lettherebe.com",
  "Shivaya is the backbone of Alex's day-to-day operations — and a remarkable presence in her own right. Patient, multi-talented, and deeply organized, she leads internal meetings, supports leadership, and keeps the company running with grace and purpose."),
]

def clean_li(url):
    if not url: return None
    return url.split("?")[0]

NAV = '''<header class="nav">
  <div class="nav-inner">
    <a class="nav-logo" href="index.html"><img src="assets/logo-left.png" alt="Let There Be — Science Marketing"></a>
    <button class="nav-toggle" aria-label="Menu"><span></span></button>
    <ul class="nav-links">
      <li class="has-dropdown">
        <a href="engine.html">Science Marketing Engine</a>
        <ul class="dropdown">
          <li><a href="engine.html">Overview — The Model</a></li>
          <li><a href="lit-review.html">Lit Review™</a></li>
          <li><a href="claim-dev.html">Claim Dev™</a></li>
          <li><a href="science-story.html">Science Story™</a></li>
        </ul>
      </li>
      <li class="has-dropdown">
        <a href="studio.html">Science Studio</a>
        <ul class="dropdown">
          <li><a href="studio.html">Overview — The Studio</a></li>
          <li><a href="moa-moment.html">MOA Moment™</a></li>
          <li><a href="influencer-science-kit.html">Influencer Science Kit™</a></li>
          <li><a href="ad-to-education.html">Ad-to-Education Sequence™</a></li>
        </ul>
      </li>
      <li><a href="work.html">Work</a></li>
      <li><a href="about.html" class="active">About</a></li>
      <li><a class="nav-cta" href="contact.html">Get Started</a></li>
    </ul>
  </div>
</header>'''

FOOTER = '''<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-logo">
        <img src="assets/logo-left.png" alt="Let There Be — Science Marketing">
        <p class="footer-tag">Empowering healthcare brands to tell their Science Story™ since 2013.</p>
      </div>
      <div>
        <h4>The Engine</h4>
        <ul>
          <li><a href="engine.html">Overview — The Model</a></li>
          <li><a href="lit-review.html">Lit Review™</a></li>
          <li><a href="claim-dev.html">Claim Dev™</a></li>
          <li><a href="science-story.html">Science Story™</a></li>
        </ul>
      </div>
      <div>
        <h4>Science Studio</h4>
        <ul>
          <li><a href="studio.html">Overview — The Studio</a></li>
          <li><a href="moa-moment.html">MOA Moment™</a></li>
          <li><a href="influencer-science-kit.html">Influencer Science Kit™</a></li>
          <li><a href="ad-to-education.html">Ad-to-Education Sequence™</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="work.html">Work</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="https://www.linkedin.com/company/let-there-be/" target="_blank" rel="noopener">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <p>Science Story™, What's Your Science Story?™, Gem Discovery™, Polishing Gems™, MOA Moment™, Influencer Science Kit™, Ad-to-Education Sequence™, Lit Review™, and Claim Dev™ are trademarks of Let There Be.</p>
      <p>© <span data-year>2026</span> Let There Be. All Rights Reserved. — lettherebe.com</p>
    </div>
  </div>
</footer>'''

PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{name} — Let There Be</title>
<meta name="description" content="{name}, {role} at Let There Be — {meta_desc}">
<link rel="icon" href="assets/mitosis-1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>

{nav}

<main id="main">

<section class="bio-hero">
  <div class="blob-stage blob-corner-tr" data-blob="ambient" data-palette="{palette}" style="opacity:0.4"></div>
  <div class="wrap bio-hero-inner">
    <div class="bio-portrait {color} reveal">
      <img src="assets/team/{headshot}" alt="{name}">
    </div>
    <div class="bio-intro">
      <a class="bio-back reveal" href="about.html">← Meet the Team</a>
      <h1 class="reveal reveal-d1">{name}</h1>
      <div class="bio-role reveal reveal-d1">{role}</div>
      <p class="bio-meta reveal reveal-d2">{location}</p>
      <div class="btn-row reveal reveal-d2">{buttons}</div>
    </div>
  </div>
</section>

<section class="bio-body">
  <div class="wrap">
    <hr class="divider mb-3 reveal">
    <span class="label reveal">About</span>
    <p class="lead reveal reveal-d1">{about}</p>
  </div>
</section>

<section class="cta-band">
  <div class="wrap">
    <hr class="divider center mb-2">
    <h2 class="reveal">What's your Science Story™?</h2>
    <p class="reveal reveal-d1">Every consumer health brand has a compelling Science Story™ waiting to be told.</p>
    <a class="btn reveal reveal-d2" href="contact.html">Let's Find It</a>
  </div>
</section>

</main>

{footer}

<script src="js/main.js"></script>
</body>
</html>
'''

palette_map = {"ph-mint":"1","ph-sky":"3","ph-purple":"2","ph-coral":"0","ph-yellow":"0"}

def esc(s): return html.escape(s, quote=True)

count = 0
for (name, slug, headshot, color, role, tagline, location, li_raw, email, about) in TEAM:
    li = clean_li(li_raw)
    buttons = []
    if li:
        buttons.append(f'<a class="btn" href="{li}" target="_blank" rel="noopener">Connect on LinkedIn ↗</a>')
    if email:
        buttons.append(f'<a class="btn-ghost" href="mailto:{email}">Email {name.split()[0]}</a>')
    btn_html = "\n        ".join(buttons) if buttons else ""
    page = PAGE.format(
        name=esc(name), role=esc(role), meta_desc=esc(tagline),
        nav=NAV, footer=FOOTER, color=color, headshot=headshot,
        palette=palette_map[color], location=esc(location),
        buttons=btn_html, about=esc(about))
    with open(f"{SITE}/bio-{slug}.html","w",encoding="utf-8") as f:
        f.write(page)
    count += 1

print(f"Wrote {count} bio pages")

# ---- Rebuild the about.html team grid with links ----
ph = open(f"{SITE}/about.html",encoding="utf-8").read()

# grid roles (keep the short existing labels) keyed by slug
GRID = {
 "alex-gelbert":("Founder & CEO","Our longtime visionary — leading everything from strategy to new product development to client partnerships.","headshot-01.png","ph-mint"),
 "matthew-matlin":("Creative Director","Shapes the creative direction of every video we make.","headshot-12.png","ph-sky"),
 "austin-miller":("Content & AI Strategist","Merges strategy, research, and creative to build Science Stories.","headshot-05.png","ph-coral"),
 "brad-eason":("Senior Account Manager","Catches the small details that make a video perfect.","headshot-04.png","ph-purple"),
 "lauryn-giannace":("Account Manager","Creates order from chaos and keeps every project on track.","headshot-13.png","ph-yellow"),
 "giselle-ghaffari":("Account Manager","Connects the dots between teams and clients.","headshot-03.png","ph-mint"),
 "nate-bundy":("Account Manager","Keeps projects moving and clients smiling.","headshot-15.png","ph-sky"),
 "alexa-mastrogiacomo":("Account Manager","Brings clarity to every project she touches.","headshot-16.png","ph-coral"),
 "louis-dubois":("Lead 2D Animator","Shows complex concepts simply — in 2D and 3D.","headshot-14.png","ph-purple"),
 "ana-mortari":("Illustrator & 2D Animator","Brings ideas to life through illustration and animation.","headshot-08.png","ph-yellow"),
 "marie-maxime-giguere":("Illustrator & 2D Animator","Synthesizes ideas into beautifully crafted videos.","headshot-02.png","ph-mint"),
 "josh-ireland":("3D Animator","Builds the dimensional worlds our science lives in.","headshot-09.png","ph-sky"),
 "julide-cakiroglu":("2D Animator","Motion with precision, frame by frame.","headshot-11.png","ph-coral"),
 "lindsey-polevoy":("Script Writer","Finds the story in the most unexpected places.","headshot-06.png","ph-purple"),
 "alexander-fabian":("Sales Lead","Builds the connections that keep opportunities moving.","headshot-10.png","ph-yellow"),
 "shivaya-urcuyo":("Executive Assistant","Keeps the engine running on time.","headshot-07.png","ph-mint"),
}
order = [t[1] for t in TEAM]
namemap = {t[1]:t[0] for t in TEAM}
delays = ["","reveal-d1","reveal-d2","reveal-d3"]
cards=[]
for i,slug in enumerate(order):
    role,fun,hs,color = GRID[slug]
    nm = namemap[slug]
    d = delays[i%4]
    cls = "team-card reveal" + ((" "+d) if d else "")
    cards.append(
      f'<div class="{cls}"><a class="ph {color}" href="bio-{slug}.html" aria-label="{esc(nm)} — {esc(role)}">'
      f'<img src="assets/team/{hs}" alt="{esc(nm)}" loading="lazy"></a>'
      f'<h3><a href="bio-{slug}.html">{esc(nm)}</a></h3>'
      f'<div class="role">{esc(role)}</div>'
      f'<p class="fun">{esc(fun)}</p></div>')
new_grid = '<div class="team-grid mt-2">' + "".join(cards) + '</div>'

new_ph = re.sub(r'<div class="team-grid mt-2">.*?</div></div>\s*</div>',
                new_grid + '\n  </div>',
                ph, count=1, flags=re.S)
if new_ph == ph:
    print("WARN: team-grid not replaced")
else:
    open(f"{SITE}/about.html","w",encoding="utf-8").write(new_ph)
    print("about.html team grid updated")
