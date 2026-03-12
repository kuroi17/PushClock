# 🎭 CampusTrackr Agent Usage Guide

## What Are These Agents?

The agents in `.github/copilot/agents/` are **specialized AI personalities** that enhance GitHub Copilot's responses. They give Copilot specific expertise, workflows, and communication styles.

### ❌ What They Are NOT:

- They are NOT part of your CampusTrackr application code
- They are NOT backend APIs you need to call
- They do NOT run on a server or get deployed

### ✅ What They ARE:

- Specialized instructions for GitHub Copilot
- Expert personas that help YOU code better
- Development assistants working in VS Code

---

## 🚀 How to Use Agents

### Method 1: Using GitHub Copilot Chat (Recommended)

Open GitHub Copilot Chat in VS Code (`Ctrl+Shift+I` or click the chat icon) and use these commands:

#### Frontend Development

```
@workspace Use the Frontend Developer agent to create a responsive navigation bar
```

```
@workspace With Frontend Developer expertise, optimize the rendering performance of my Dashboard component
```

#### UI/UX Design

```
@workspace As the UI Designer, suggest improvements for my login page layout
```

```
@workspace Use UX Architect principles to restructure my component hierarchy
```

#### Backend/API Work

```
@workspace With Backend Architect expertise, help me design a REST API for student data
```

#### Feature Planning

```
@workspace As Sprint Prioritizer, help me break down this feature into tasks
```

---

## 📚 Available Agents in Your Project

### 1. **Frontend Developer** (`engineering-frontend-developer.md`)

- **Expertise**: React, Vite, modern web development, performance optimization
- **Use for**: Building components, fixing bugs, optimizing performance, accessibility
- **Example**: "Help me create a reusable Card component with Tailwind CSS"

### 2. **UI Designer** (`design-ui-designer.md`)

- **Expertise**: Visual design, Tailwind CSS, design systems, aesthetics
- **Use for**: Layout improvements, color schemes, typography, visual polish
- **Example**: "Suggest a color palette for my dashboard that's accessible and modern"

### 3. **UX Architect** (`design-ux-architect.md`)

- **Expertise**: User experience, component architecture, navigation flows
- **Use for**: User flows, information architecture, UX improvements
- **Example**: "Review my registration flow and suggest UX improvements"

### 4. **Backend Architect** (`engineering-backend-architect.md`)

- **Expertise**: API design, Supabase, database schema, server architecture
- **Use for**: Supabase queries, database design, API integration
- **Example**: "Help me design a Supabase schema for tracking student locations"

### 5. **Sprint Prioritizer** (`product-sprint-prioritizer.md`)

- **Expertise**: Feature prioritization, task breakdown, development planning
- **Use for**: Planning features, breaking down work, prioritizing tasks
- **Example**: "Help me prioritize these 5 features for the next sprint"

---

## 💡 Best Practices

### 1. Be Specific with Your Requests

❌ Bad: "Make this better"
✅ Good: "@workspace Use Frontend Developer expertise to improve the performance of this component by implementing React.memo and useCallback"

### 2. Reference the Agent's Expertise Area

When you want specialized help, explicitly mention the agent role:

```
@workspace As the UI Designer, review this color scheme
@workspace With Backend Architect expertise, optimize this Supabase query
```

### 3. Combine with Workspace Context

Use `@workspace` to give Copilot access to your entire project:

```
@workspace Use Frontend Developer to analyze all components and find performance bottlenecks
```

### 4. Use for Code Reviews

```
@workspace As the Frontend Developer, review this component for best practices
```

### 5. Use for Architecture Decisions

```
@workspace With Backend Architect expertise, should I use Supabase RLS or handle permissions in my React app?
```

---

## 🎯 Example Workflows

### Building a New Feature

1. **Planning**: "@workspace As Sprint Prioritizer, break down this notification feature into tasks"
2. **Design**: "@workspace As UI Designer, suggest a layout for notification cards"
3. **Implementation**: "@workspace Use Frontend Developer to build the notification component with React and Tailwind"
4. **Backend**: "@workspace With Backend Architect expertise, create Supabase queries for notifications"
5. **Polish**: "@workspace As UX Architect, review the notification flow for usability issues"

### Fixing a Bug

```
@workspace Use Frontend Developer expertise to debug why my form submission isn't working
```

### Optimizing Performance

```
@workspace As Frontend Developer, analyze my App.jsx and suggest performance optimizations
```

### Refactoring Code

```
@workspace With Frontend Developer expertise, refactor this component to use better React patterns
```

---

## 🔧 Technical Details

### Agent File Structure

Each agent file contains:

- **YAML frontmatter**: Name, description, personality traits
- **Identity section**: Role, personality, experience
- **Core mission**: Specific responsibilities and workflows
- **Technical deliverables**: Code examples and patterns
- **Rules and guidelines**: Best practices to follow

### How It Works

1. When you reference an agent in Copilot Chat, GitHub Copilot loads that agent file
2. The agent's personality, expertise, and guidelines influence Copilot's responses
3. You get more specialized, context-aware, and expert-level assistance

### Customizing Agents

You can edit any agent file in `.github/copilot/agents/` to:

- Add CampusTrackr-specific patterns
- Include your team's coding standards
- Add custom workflows or examples

---

## 📖 Learning More

### Agency Agents Documentation

- Full repository: `agency-agents/` folder (cloned from GitHub)
- Main README: `agency-agents/README.md`
- More agents available in various categories (marketing, game dev, spatial computing, etc.)

### Adding More Agents

To add more agents from the repository:

```powershell
# Copy any agent you want
Copy-Item "agency-agents\[category]\[agent-name].md" ".github\copilot\agents\"

# Example: Add Testing Agent
Copy-Item "agency-agents\testing\testing-qa-tester.md" ".github\copilot\agents\"
```

Then restart VS Code and the agent will be available.

---

## 🆘 Troubleshooting

### Agents Not Working?

1. **Restart VS Code**: After adding agents, restart VS Code
2. **Check GitHub Copilot**: Ensure Copilot is enabled and working
3. **Check File Paths**: Agents must be in `.github/copilot/agents/`
4. **Use @workspace**: Always use `@workspace` in your Copilot Chat messages

### Want Different Behavior?

- Edit the agent files directly
- Add CampusTrackr-specific examples
- Modify the personality or communication style

---

## 🎉 You're Ready!

Start by trying this in Copilot Chat:

```
@workspace Use Frontend Developer expertise to review my src/App.jsx file and suggest improvements
```

Happy coding with your AI team! 🚀
