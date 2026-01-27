---
description: How to push a branch and create a Pull Request with a standardized description.
---

1. Analyze the differences between your current branch and the base branch (usually `main`).
   ```bash
   git diff main..<your-branch> --stat
   ```

2. Publish the branch to the remote repository.
   ```bash
   git push -u origin <your-branch>
   ```

3. Create a Pull Request using the GitHub MCP tool `create_pull_request`.
   - **Title**: Use a concise title prefixed with the change type (e.g., `Feat:`, `Fix:`, `Refactor:`, , `Chore:`).
   - **Description**: Follow this mandatory structure:

   ```markdown
   ## Summary
   [Brief description of the objective and overall change]

   ## Key Changes
   ### [Category: e.g. Architecture, UI, Features]
   - [Change 1]
   - [Change 2]

   ### [Category]
   - [Change 3]

   ## Verification Plan
   - [Verification steps taken or required]
   ```

4. **Restriction**: Do NOT include direct links to files in the description.
5. Notify the user with the PR URL.