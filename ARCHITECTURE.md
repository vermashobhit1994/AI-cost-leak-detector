# Requirements analysis

### functional requirements

1.  user details for all AI tools:

- **name** of each AI tool
- **plan** of each AI tool
- **current monthly money spend** for each AI tool
- number of seats for user
- team size for user
- primary use case for user (coding / writing / data / research / mixed / other)

2. Audit Engine (cost analysis for all AI tools used by user)

- overspending on each AI tool
- showcase what AI tool cause more spend of money and what cause less
  **switch** to AI tool that cost less money.
  **downgrade** AI tool that cost more money.
- total monthly and annual savings.

3. capture report via email
    - no login and email is shown **after cost analysis (step2)**

4. **book** Credex consultation - for high-savings
5. result display by **shareable unique public url** using
   **Open Graph previews**

### non-functional requirements

1. SEO

- visitor land on landing page from

1. tweet
2. blog post
3. hacker news

4. Spend input form - state must persist when page reload
    - localstorage use

5. Audit Engine

- logic must be defensible i.e. actual usuage-fit reasoning with number.
- pricing data must be **current pricing** for submission week.
- **current pricing** -> PRICING_DATA.md ,<br>
  each number -> official pricing page URL

#### functional requirements more details

1. spend input form
   name and plan of AI tools supported
    1. name - Cursor <br>
       plan - Hobby, Pro, Business, Enterprise <br><br>

    2. name - Github copilot <br>
       plan - Individual, Business, Enterprise <br><br>
    3. name - Claude <br>
       plan - Free, Pro, Max, Team, Enterprise, API direct<br><br>

    4. name - ChatGPT <br>
       plan - Plus, Team, Enterprise, API direct <br><br>

    5. name - Anthropic <br>
       plan - API direct <br><br>

    6. name - OpenAI <br>
       plan - API direct <br><br>

    7. name - Gemini <br>
       plan - Pro, Ultra, API <br><br>

    8. name - Windsurf <br>
       plan -

    9. name - v0 <br>
       plan -

2. Audit engine
    - AI tool usuage calculation using AI tool plan
    - suggest and provide cheaper plan from same vendor based on usuage calculation.
    - suggest and provide cheaper alternative tool with similar capability
      based on their use case
    - check if AI tool user paying for via retail and then suggest AI tool
      payment through credit after checking via retail.

    - non-functional
        - logic must be defensible i.e. actual usuage-fit reasoning with number.
        - pricing data must be **current** from **PRICING_DATA.md**<br>
          every number -> official pricing page URL

3. Audit results page - **page that gets screenshot and shared**
4. for each AI tool used by user
    - current spend
    - recommended action for savings money (with 1 sentence reason)

5. Hero section
    - total monthly savings + total annual savings
    - must be big and clear
6. if audit savings > $500/month
    - show Credex company for capturing more of that savings.
7. if audit savings <$100/month or already-optimal
    - show "You're spending well"
    - **don't manufacture savings**
    - capture lead(that details) with signup ("notify me when new optimizations
      apply to your stack")

**visual quality must be excellent**

4. AI generated personalised summary
    - generate 100 word personalized summary paragraph based on audit
      **use Anthropic API or LLM**

    - non functional requirements
        1. handle API failure (fallback to templated summary)
        2. prompts write in PROMPTS.md

5. Lead capture and storage
    - email capture with optional fields
        1. company name
        2. role
        3. team size
    - store fields in backend
        - Example -> Supabase, Firebase, Cloudflare D1, Postgres on Render

    - send transactional email confirming audit and noting Credex will
      reach out for high-savings cases.
        - transaction email -> Resend / Postmark / SES free tier
    - basic abuse protection
        1. rate limit
        2. honeypot
        3. hCaptcha
           **Document your choice and why**

6. shareable result URL
    - each audit gets unique public URL
        - identify details i.e. company name, email
        - tools and savings numbers shown
    - open graph tags for clean link previews (Twitter card too)
      **viral loop design very carefully**

additional requirements

1. PDF export of full report
    - embeddable widget version (<script> tag a blogger could drop in)
    - benchmark mode
        - "your AI spend per developer is $X" -> companies your size average $Y
    - referral codes -> share the tool, both parties gets a perk
    - short blog post or twitter thread draft pitching the tool, written as if
      you were launching it.

### pages
