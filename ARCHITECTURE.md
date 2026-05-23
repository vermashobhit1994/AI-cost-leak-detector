# Step1- Requirements analysis

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


right plan depend
1. monthly spend
2. team size
3. number of seats
4. primary use case


### pages


### approach to solve problem

My approach to find right plan based on usuage, find cheaper plan from 
same vendor, find cheaper alternative tool based on usecase

for each tool
- calcuate total cost based on existing plans by company(monthly charges, yearly charges
(per month), yearly charges, tax(if applied), number of users, number of seats,
team size, purpose of tool )

- cost given by user for each tool
 (depends on number of users, number of seats, team size, tool purpose, tool name,
 tool plan, current monthly spend)

- for each tool, find cost difference.
cost calculated based on plan given by company and cost given by user

- find right plan 
for current plan , calculate difference of user given cost and company plans cost
based on number of users, number of seats, team size

- find cheaper plan
for all plans from same company, calculate difference of user given cost and company plans cost and return result where difference is very low

- find chaper alternative tool with similar capability based on their use case
for all plans from all company, calcuate difference of user given cost and 
company plans cost and return result where difference is very low

- hardcoded array, that store what **AI tool**  and their **current capabilities** 
  example claude code -> coding 
  claude opus 4.7 -> reasoning, agentic coding
  claude sonnet 4.6 -> speed and intelligence
  claude halku 4.5 -> fastest and near-frontier intelligence

  
### what's hypothesis I used when calculate user amount(paid monthly and paid yearly)?

### what's assumption when calculating user amount(paid monthly and paid yearly)?
Github copilot - they don't charge GST(18%)
Grok -   they don't charge GST(18%)


### where we can find cost leak?
1. using wrong tool for wrong use-case(purpose)
2. user team size <=2 and using Team plan 





### calculate API token usuage price?

input -> input tokens number
      -> output tokens number 
	  -> cache read input tokens number 
	  -> cache creation input tokens 
	  -> session duration 
	  
output -> total API cost 

how to calculate 
input tokens cost -> (model base input per 1M cost/1000000) x input token number
output tokens cost -> (model output token per 1M cost / 1000000) x output token number 
cache read input token cost ->  

provide both API price direct write and calculate using above parameters
(for both claude and openai)


# Tech stack choices  

## Frontend



## backend 



# Step2 - data modelling
1. AI tool data 
2. user given data 
3. user estimated data 


**What're factors on which pricing of any model depends on?**

1. Claude models
  
2. open AI models




Q. how to minimise token usuage to save money?


