# Pre-commit Hook Setup

This project includes a pre-commit hook to catch TypeScript errors before they reach your deployment pipeline.

## What it does

The pre-commit hook automatically runs:
1. **TypeScript type checking** (`pnpm run type-check`) - Catches type errors
2. **ESLint** (`pnpm run lint`) - Catches linting errors

If either check fails, the commit will be blocked until you fix the issues.

## Manual checks

You can also run these checks manually:

```bash
# Type check only
pnpm run type-check

# Full build (includes type check + build)
pnpm run build

# Pre-commit checks (type check + lint)
pnpm run pre-commit
```

## Disabling the hook (temporary)

If you need to bypass the hook for a specific commit (not recommended):

```bash
git commit --no-verify -m "your message"
```

## Setting up the hook

The hook is already set up in `.git/hooks/pre-commit`. If you need to reinstall it:

```bash
chmod +x .git/hooks/pre-commit
```

## CI/CD Integration

For Coolify deployments, ensure your build process runs `pnpm run build` which includes type checking. The build will fail if there are TypeScript errors, preventing broken code from being deployed.

