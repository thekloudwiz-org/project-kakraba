# Application Scripts

This directory contains utility scripts for building and packaging the Lambda application.

## Available Scripts

### `package-lambda.sh`

Builds and packages the Lambda function for deployment.

**Usage:**
```bash
npm run package
```

Or directly:
```bash
./scripts/package-lambda.sh
```

**What it does:**

1. **Cleans previous builds**
   - Removes old `lambda.zip`
   - Cleans `dist/node_modules`

2. **Compiles TypeScript**
   - Runs `tsc` to compile `.ts` files to `.js`
   - Generates source maps for debugging

3. **Installs production dependencies**
   - Runs `npm ci --production`
   - Only includes runtime dependencies (no dev dependencies)

4. **Copies dependencies**
   - Copies `node_modules` to `dist/`

5. **Creates ZIP package**
   - Creates `lambda.zip` with all necessary files
   - Compresses quietly for cleaner output

6. **Restores dev dependencies**
   - Runs `npm ci` to restore all dependencies
   - Ensures development environment is intact

7. **Validates package**
   - Shows package size
   - Lists package contents
   - Displays total file count

**Output:**
- `lambda.zip` - Ready-to-deploy Lambda package (~3-4MB)

**Package Contents:**
- Compiled JavaScript code (`handlers/`, `services/`, `repositories/`, `types/`)
- Production dependencies (`node_modules/`)
- Source maps (`.js.map`, `.d.ts` files)

---

## Package Validation

After running the script, verify:

```bash
# Check package size
ls -lh lambda.zip

# List contents
unzip -l lambda.zip | head -20

# Verify handler exists
unzip -l lambda.zip | grep "handlers/index.js"

# Check dependencies
unzip -l lambda.zip | grep "node_modules/@aws-sdk"
```

---

## Troubleshooting

### TypeScript Compilation Errors

If `tsc` fails:
```bash
npm run build
# Fix any TypeScript errors
```

### Package Too Large

If package exceeds Lambda limits (50MB):

1. Check for unnecessary dependencies:
   ```bash
   npm ls --production
   ```

2. Remove unused dependencies:
   ```bash
   npm uninstall <package-name>
   ```

3. Consider using Lambda Layers for large dependencies

### Missing Dependencies

If Lambda fails with "Cannot find module":

1. Ensure dependency is in `dependencies` (not `devDependencies`):
   ```json
   {
     "dependencies": {
       "@aws-sdk/client-dynamodb": "^3.490.0"
     }
   }
   ```

2. Rebuild package:
   ```bash
   npm run package
   ```

### Permission Denied

Make script executable:
```bash
chmod +x scripts/package-lambda.sh
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Build Lambda Package
  run: |
    cd app
    npm ci
    npm test
    npm run package
    
- name: Upload Artifact
  uses: actions/upload-artifact@v3
  with:
    name: lambda-package
    path: app/lambda.zip
```

### GitLab CI

```yaml
build:
  script:
    - cd app
    - npm ci
    - npm test
    - npm run package
  artifacts:
    paths:
      - app/lambda.zip
    expire_in: 1 week
```

---

## Manual Packaging (Alternative)

If you need to package manually without the script:

```bash
# 1. Build TypeScript
npm run build

# 2. Install production dependencies
npm ci --production

# 3. Copy dependencies
cp -r node_modules dist/

# 4. Create package
cd dist
zip -r ../lambda.zip .
cd ..

# 5. Restore dev dependencies
npm ci
```

---

## Package Optimization

### Reduce Package Size

1. **Remove unnecessary files:**
   ```bash
   # Add to .npmignore or exclude in zip
   - *.test.js
   - *.spec.js
   - *.map files (if not needed)
   ```

2. **Use webpack/esbuild:**
   - Bundle code into single file
   - Tree-shake unused code
   - Minify output

3. **Use Lambda Layers:**
   - Move AWS SDK to layer
   - Share common dependencies across functions

### Example with esbuild

```json
{
  "scripts": {
    "bundle": "esbuild handlers/index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js"
  }
}
```

---

## Best Practices

1. **Always run tests before packaging:**
   ```bash
   npm test && npm run package
   ```

2. **Verify package contents:**
   ```bash
   unzip -l lambda.zip | grep -E "(handlers|node_modules)"
   ```

3. **Check package size:**
   ```bash
   du -h lambda.zip
   ```

4. **Keep dependencies minimal:**
   - Only include what's needed
   - Regularly audit dependencies

5. **Version your packages:**
   ```bash
   mv lambda.zip lambda-v1.0.0.zip
   ```

---

## Environment-Specific Builds

For different environments, you can create variants:

```bash
# Development build (with source maps)
npm run package

# Production build (optimized)
NODE_ENV=production npm run package
```

---

## Related Documentation

- [Lambda Deployment Guide](../DEPLOYMENT.md)
- [Infrastructure Deployment](../../infra/DEPLOYMENT_GUIDE.md)
- [Testing Guide](../README.md#testing)
