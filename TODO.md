
- Add file view tab per project. I want the user to have view over the files. ✅
- Add members button should be disabled in local mode as this is single user only. ✅
- Add light mode and dark mode support. ✅
- In settings, add danger zone, the user should be able to reset local data. let user know that project or vindicta.json is not affected. only the data within the app is deleted. ✅
- Some functions are not persistent, make sure to utilize sqlite locally.
- the onboarding or welcome page doesnt have titlebar. ✅
- The titlebar drag still not working. also the close, minimize and maximize buttons are not working as well. ✅
- The cards or steps in kanban are ugly. make it premium. also its too rounded. when adding ticket or items, use modal style. ✅
- The profile section in settings should have different or dedicated sidebar item for it. Add Account or Profile item in the sidebar. ✅
- in the settings page, make option to auto startup on selected mode. ✅
- in the welcome page, add checkbox to auto startup on selected mode. ✅
- remove the offline/online mode. i decided to make the entire app to be local-only. but make sure its ready for scaling to cloud mode. ✅
- The hide and show button of the sidebar seems to occupy space in sidebar, can we change that to small button beside the vindicta icon on the top of sidebar? ✅
- add function to delete the project, ask if remove from app only or also include the vindicta.json from deletion. ✅
- Add more component like analytics, some animations on the dashboard page. ✅
- Edit this TODO.md file add another sections for some improvements and things project management tools like this should have. ✅
- Use Ubuntu Font ✅
- In the File tabs (the thing i mentioned earlier): Add some CLAUDE.md or AGENT.md detector. Add warning or note if these things are not detected. ✅
- Is it possible to embed claude code like a UI for claude code within this app. im planning to add it on the project tabs as well and also will be utilize by automated development. ✅
- Add tickets tabs to view all tickets. ✅
- The icons of the code editor in the project add modal, can we use the real icons. ✅
- I dont know how is local data is being stored. Inside the settings, can we add advance section that has difference options for it, add an option to view raw data like in json to view all local data. ✅
- Implement notificaiton, make sure its toggalbe in settings. ✅


---

- File Issue: Failed to read directory
- Claude Issue: program not allowed on the configured shell scoped: claude
 - Board Issue: Tickets/Items cant be drag to other steps.
- Project Deletion: add Validation like i need to retype the project name before it is deleted.
- The scrollbar is ugly, can we hide it and create our own - only show when scrolling and auto hides/fades
- lightmode is only working in the sidebar and titlebar but not on the actual pages.

---

- Add project code - when adding new project ask user about code like 3 letter identification then when creatng ticket we can concatenate some numbers on it like Jira style. 
- Auto-generate tickets from codebase analysis (via Claude or whatever coding ai is used) - add button on top as option.
- In the future codex will be added here as a coding agent together with claude.
- Maybe we can rename the Claude tab to something else.
- Give the AI capability to trasnfer or change the ticket status
- Theres no option to add tickets on the Sprint, give AI power to create ticket as well as asigning it to sprint.
- Create dedicated page for tickets like it should have many metadata like titles, date created, histories, descriptions, comments and more. maybe comment to comment. likes and many more. make sure these are persistent and saved locally. Make sure AI has control over this.
- Combine the Tickets tab and Backlog tabs, add the backlog section below the tickets.
- Add notification like for action needed when AI commented on the tickets/task. or when like action is completed.
- Improve the project settings UI, add multi level or selection or sections
- In project settings, move the delete button there under danger zone section.
- In project setggins, add rename and other update functions.

---

- The kanban items/tickets cant be drag to change their status.
- The kanban items/tickets cant be click to open their details like in the ticket page.
- Sprint page, the sprint already took off even start date is not even today, add option or button "Start Now" then override the datetime. make the dates datetime, if start datetime is now or in the future, start the sprint.
- I changed the name of the project and it was not added on the project name. 

---

- Issue: I cant add ticket on sprint during plaaning phase.
- In project settings, danger zone - add option to delete all data within the project like the tickets, sprints and history
- ticket comment showing user - use the name i gave during onboarding.
- add integration with claude code. claude code still not working. - integrate with Generate with AI.

---

- the board tab should be general ticket, i mean all tickets are cascade here.
- on the project banner, add indicator if sprint is currently running, if so add button too to navigate to sprint board - board that only shows ticket related to this sprint.
- AI Agent tab Issue: The filename, directory name, or volume label syntax is incorrect.
- in sprint tab: Unassigned tickets doesnt show the ticket code.

---

- Add notification with toast.
- In sprint creation, add warning modal that spring will be run immediately if the datetime set it now or in the past.
- In sprint creation, make it wizard type, on the second node- ask user about plan or goal, this will be sent to AI agent in planning mode and will be able to automatically create tickets for this.
- Remove the Board tab, only show it if theres running sprint
- The sidebar hide button is good but is missing when the sidebar is hidden so icant maximize the size again.

---

- In settings, above the danger zone, add purple "Developer Zone", create options to test toast notification.
- In Sprint Creation, the second note should have textbox and let the user type about the goal of the sprint and possible task. make sure its in markdown format so add markdown parser.
- Sprint start button, add warning when starting the sprint without ticket or task on it.
- after i add the ticket, i cant seems to view the ticket under the sprint. 

---

- in ticket tab, i cant manually add ticket
- After adding project, i am being redirected to the board page even theres no sprint started yet.
- Risk detection: flag tickets with no description or vague titles

---

- Create directory on Documents page where git project is stored. this is for project that will be pulled or imported thru git clone
- When adding project, implement git clone aside from importing exisitng local project. for git cloned project store in in the Documents/Vindicta

--- 

- When adding new ticket:
Add checkbox "Git Control" - If this is checked show various option related to git like branch where AI have to work on. - should only have this option if theres .git directory
Add option to auto commit and push
- Pre-filled the ticket number or code.
- ticket description should be markdown.
- I added ticket on a sprint, and i cant see the tickets under the sprint, can you add according type or dropdown type for the tickets under the sprint.
- In settings, add "Doctor" section, this section is responsible for checking the app state and error or whats lacking or whats the problem and it fixes those.
- In settings, add SMTP support for email notification.
- in project, add another tab called "Info" - this will display or render the README.md file. 

---

- When adding a new project, the third node in the wizard where you select AI Tool, include Codex and make it multiple selection i mean user can use multiplke AI Tool right?
- After adding the project on the Vindicta, when first clicked the project, add a pop up modal to ask user which AI Tool he want to use for this, for now Codex only.
- In project page, under the project name and path, add like a message bubble where AI ORB with orbits has bubble message talking like descripbing the project to the user. and also instructing the user on how Vindicta works.

---

- Remove the AI Agent tab in project page.
- Make the Info tab as leading tab
- In Board tab, make the Columns to be default view. Maybe its better to remove the cascade view and add Queue view for AI's working queue.
- Include Codex health check in doctor in settings, if its working and connected to codex ai

---

- the sprint creation - generate from plan is not working, i think its not integrated with codex yet. The codex should be able to generate tickets with the plan and present it to user then finalize and then save the tickets.
- add npm check on the doctor as well since the codex download will be using npm. its more sense if we check if there npm as well.
- enhance and redo the UI for the checkboxes, i just notice that all checkboxes is out of design and is plain html checkboxes. align it with current design.

---

- During AI Sprint Plan, the user will be asked for the goal, the AI will generate the ticket, however i want to insert another process where AI should ask or clarify questions, so there should be a option UI for answering the AI. Add this process. 
- do not include the projects in the doctor checks
- In the profile, can we add or monitor token usage
- In ticket tab in projects, remove the Generate with AI button.
- When I mark the sprint as done, all incomplete tickets/task must be removed from the sprint and move to backlog status.

---

- remove the vindicta.png and create your own logo of vindicta in the sidebar.
- The Sprint planning questions, make it wizard type, let the AI give us options and free text option.
- Add checkbox if Codex clarification pass or questioning is needed but also warn user that its better to check this box to better plan the ticket creation.
- Remove the SMTP section in settings. - no longer needed.
- Change light mode to more darker light, its too bright right now.

---

- board tab should only display tickets within the running sprint.
- remove the auto-start, user should always start with the welcome page.
- improve the UI for the profile. Add button to Sign In and redirect user to dedicated login page, Github login and Google login are the options but disable right now and add note that this is ongoing development,
- The token usage is too codex-centric, this app will be using claude as well in the future, can you indicate the model being use instead of codex-only? and maybe add history of the prompts so user know which prompt is being run.

---

- I added TextType component in the LaunchScreen can you change the string it outputs and show? and also implement it in other part of the app like the message bubble in the project.
- Make the prompt in the prompt history clickable to show the entire prompt, maybe open a drawer or a model.

---

- Issue: when you refresh the entire app in Profile page, the projects are not showing and you need to naviate to dashboard for the project to show up.
- Added vindicta.ico in the root directory. move it to assets or which director. repace the icon of the app.

---

- Above settings item in the sidebar, add Service Controller item and page, this is page for control panel and controlling postgres, redis, rabbitmq and other services. I'm planning to recreate XAMPP in modern techs within this app. i want you to create the UI for now.

---

- Can we make the project list to be dropdown selector in bottom where user can select which project to be use so that the project section right now, we can use it for other things related to selected project. The current Projects sections, i want to replace it with Tools, and the tools below it will be tied on which project is selected. 
- Move the Service Controller on the tools section
- Add Security Analyzer as another page and item under tools section.

---

- Rename the Dashboard to Home page, redo and change the entire UI of the Home page. I want it to be welcoming and add some news, guide, updates and other things like "Get Vindicta Certified"
- In LaunchScreen, can we change the button to Outlined instead of Solid type of button.
- In LunchScreen, add like fade outline and show doctor result like system check or somekind of that.

--- 

- As part of onboard, ask the user about project management experience, software engineering experience and more so we can give better dev expereince to the user.
- Rename the Tools section to Project Tools, then create another section called App Tools, move the Service Controller item there.

---

- Security analyzer page, remove the mock data
- Security analyzer page, Add "Run AI Scan" - Ask user to which AI tool to use, claude or codex (Codex for now. no Claude integration as of the moment)
- Security analyzer page, disable the Run Scan button as this is manual scan and not implemented
- Once Run AI Scan is ran, let the selected AI to do full scan on the app. find like abusable functions, OWASP. Allow the AI to present the findings, ask the user if need to send the finding to backlogs.

---

- During AI Scan in security analyzer, is AI thought available? I want to add some UI to show whats happening in the background during analyzing phase. Is this possible?
- Issue after analyzing: Unexpected non-whitespace character after JSON at position 7497 (line 66 column 1)

---

- In Security Analyzer, Add History of results.
- In Security Analyzer, Add Export as Docs with Vindicta template. create docx tempalte for this. I want professional output or docs.
- In Security Analyzer, let the AI know exisitng tickets to avoid duplicates when AI Scan is run multiple times.

---

- i notice that its taking 100k tokens for a single AI Scan in security analyzer. Is it possible to ask the user about the effort-level. is this possible? 
- The prompt history is only showing input token, can we also show output token usage.

---

- Durng AI Scan, i dont know what happen when i swtich tab, i think the AI will continue to scan in background but i dont know if it will be parse or show. anyway, i want to create a floating notification or somekind of component that will allow user to know the status of the scan outside the security analyzer.
- In Sprint tab, on the sprint item, add button AI Handover button, this will handover the entire tickets and sprint to the AI, allow user to select AI tool, codex or claude, but codex for now. no claude itnegration as of the moment.
- once the AI Handover button is clicked, change the titlebar background to use Dither background to indicate the AI Handover or AI Working on tickets. Also show or add AI Workspace tab and show the activity or history or thoughts of the AI. like also the changes being made by the AI. Also ask user about effort level

---

- I tried to run the AI features with 0 usage left. the current error message showing is "sep is not defined". Can we use proper error message that any user could understand?
- Make the AI Workspace leading tab and maybe change font color to somekind of yellow.
- Im seeing ".vindicta_codex_prompt_1778759119200.txt" file in the root of the project. What is that? can that be remove?
- Lets create the AGENT.md - Codex, review the entire application and create the markdown. 
- Create the README.md - Codex, review the entire application and create the markdown.

---

## Roadmap — Next Milestones

- Cloud sync with conflict resolution
- GitHub integration (link tickets to PRs/issues)
- Team workspaces and real-time collaboration
- Mobile companion app
- SQLite local storage backend (replace JSON file persistence)
- Offline-first architecture with sync-on-reconnect

---

## Performance & Quality

- Keyboard shortcuts throughout (⌘K / Ctrl+K command palette)
- Bulk ticket operations (multi-select + change status/priority)
- Export project report as Markdown or PDF
- Lazy-load project data on first open only
- Virtual scrolling for large ticket lists
- Automated test suite (Vitest + Playwright)

---

## Integrations

- GitHub Issues import/export
- Linear import
- Jira migration tool
- Slack notifications webhook
- Zapier/n8n automation hooks
- GitLab integration

---

## AI Features (Automated Development)
- Sprint planning suggestions based on velocity
- Code review summary injected into History tab
- Auto-fill ticket description from commit messages
- Claude-powered "daily standup" digest
- Automated PR description generation
