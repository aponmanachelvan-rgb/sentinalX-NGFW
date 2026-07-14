# Contributing to SentinelX NGFW

Thank you for your interest in contributing to SentinelX! We welcome contributions from the community. This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional. Harassment or discrimination of any kind is not tolerated.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinelx-ngfw.git
   cd sentinelx-ngfw
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/sentinelx-ngfw.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## Development Workflow

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### Setup Local Environment
```bash
npm install
cp .env.example .env.local
# Fill in your Supabase credentials
npm run dev
```

### Code Standards

#### TypeScript
- Use strict mode: `"strict": true`
- Always provide type annotations for function parameters and returns
- Use interfaces for object types
- Example:
  ```typescript
  interface FirewallRule {
    id: string;
    sourceIp: string;
    port: number;
    action: 'allow' | 'block';
  }

  function evaluateRule(rule: FirewallRule): boolean {
    // Implementation
  }
  ```

#### React Components
- Use functional components with hooks
- Prefer `export default` for page components
- Use `'use client'` directive only when necessary
- Prop types must be explicitly defined
- Example:
  ```typescript
  interface DashboardProps {
    title: string;
    metrics: Metric[];
  }

  export default function Dashboard({ title, metrics }: DashboardProps) {
    return <div>{title}</div>;
  }
  ```

#### Database
- All new tables/columns require RLS policies
- Write parameterized queries to prevent SQL injection
- Document schema changes in commit messages
- Test queries in Supabase SQL editor first

### Commit Messages
Follow conventional commits:
```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(rules): add bulk rule import functionality`
- `fix(dashboard): resolve realtime subscription lag`
- `docs(api): update endpoint authentication details`

### Testing

#### Before Committing
```bash
# Type checking
npm run build

# Linting
npm run lint

# Manual testing
npm run dev
```

#### Testing Checklist
- [ ] Feature works in development
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Existing functionality not broken
- [ ] New code includes error handling
- [ ] Database queries are parameterized

### Pull Request Process

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues (closes #123)
   - Screenshots for UI changes
   - Database schema changes if applicable

4. **PR Template**:
   ```markdown
   ## Description
   Brief description of the change

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test the changes

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

## Areas for Contribution

### High Priority
- 🐛 Bug fixes
- 📚 Documentation improvements
- ♿ Accessibility improvements
- 🔐 Security enhancements

### Welcome Contributions
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🧪 Tests
- 🔧 Developer experience improvements
- 📊 New visualizations/features

### Before Starting Large Work
For major features or architecture changes:
1. Open an issue first to discuss
2. Wait for maintainer feedback
3. Discuss implementation approach
4. Avoid duplicate work

## Questions?

- Check [GitHub Issues](https://github.com/ORIGINAL_OWNER/sentinelx-ngfw/issues) for existing discussions
- Open a new issue with the `question` label
- Start a discussion in GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to SentinelX! 🙌**
