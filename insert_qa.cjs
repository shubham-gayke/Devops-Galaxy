const fs = require('fs');
const path = require('path');

const qaContent = `
## 22. 25 Common Git & GitHub Interview Questions

1. **What is Git?**  
   *Answer:* Git is a distributed version control system that tracks changes in source code during software development. It allows multiple developers to work together non-linearly.

2. **What is the difference between Git and GitHub?**  
   *Answer:* Git is the local version control software installed on your computer. GitHub is a cloud-based platform that hosts Git repositories and provides collaboration tools (PRs, Issues, Actions).

3. **What is a commit in Git?**  
   *Answer:* A commit is a snapshot of your repository at a specific point in time. It saves the changes you staged along with a message, author, and timestamp.

4. **What is a branch?**  
   *Answer:* A branch is an independent line of development. It acts as a pointer to a specific commit, allowing you to work on features without affecting the \`main\` codebase.

5. **What is the difference between \`git pull\` and \`git fetch\`?**  
   *Answer:* \`git fetch\` downloads new data from a remote repository but doesn't integrate it into your working files. \`git pull\` does a fetch AND immediately merges the downloaded changes into your current branch.

6. **What is the difference between \`git merge\` and \`git rebase\`?**  
   *Answer:* Both integrate changes from one branch into another. \`merge\` creates a new "merge commit" tying the histories together, preserving exact history. \`rebase\` moves the entire feature branch to begin on the tip of the target branch, creating a clean, linear history but rewriting commit hashes.

7. **What is a merge conflict and how do you resolve it?**  
   *Answer:* A conflict occurs when Git cannot automatically merge changes (e.g., two people edited the same line). You resolve it by manually opening the file, choosing the correct code, deleting the Git markers (\`<<<<<<<\`), and committing the resolved file.

8. **What does \`git clone\` do?**  
   *Answer:* It creates a local copy of a remote repository, including all files, branches, and commit history.

9. **What is the difference between a local and remote repository?**  
   *Answer:* A local repository resides on your computer. A remote repository is hosted on a server (like GitHub) and is used to share and sync code with others.

10. **What is \`HEAD\` in Git?**  
    *Answer:* \`HEAD\` is a pointer that indicates your current working commit or branch. It usually points to the latest commit of the branch you are currently on.

11. **What is a "detached HEAD" state?**  
    *Answer:* It happens when you checkout a specific commit hash instead of a branch name. You are no longer on any branch. Any commits made here will be orphaned when you switch away, unless you create a new branch.

12. **How do you undo a commit?**  
    *Answer:* Use \`git reset HEAD~1\` to undo locally and keep changes. Use \`git revert <hash>\` to create a new commit that undoes the changes (safe for shared branches).

13. **What is \`git stash\`?**  
    *Answer:* It temporarily shelves (saves) changes you've made to your working directory so you can work on something else, and then re-apply them later.

14. **How do you view commit history?**  
    *Answer:* Using \`git log\`. You can use \`git log --oneline\` for a compact view.

15. **What is a Pull Request (PR)?**  
    *Answer:* A GitHub feature where you notify team members that you have pushed a feature to a remote branch. It provides a forum for code review and discussion before merging it into the main branch.

16. **What is the difference between Fork and Clone?**  
    *Answer:* A clone is a local copy of a repository. A fork is a remote, personal copy of someone else's repository on your GitHub account, usually used to contribute to open source.

17. **What is \`git cherry-pick\`?**  
    *Answer:* A command that allows you to pick a specific commit from one branch and apply its changes onto your current branch.

18. **Explain the three areas of Git.**  
    *Answer:* 1. Working Directory (files on your computer). 2. Staging Area/Index (files marked to go into the next commit). 3. Repository (the \`.git\` folder containing saved commits).

19. **How do you delete a branch?**  
    *Answer:* Locally: \`git branch -d <branch_name>\`. Remotely: \`git push origin --delete <branch_name>\`.

20. **What is \`git commit --amend\`?**  
    *Answer:* It modifies the most recent commit. It can be used to change the commit message or add forgotten files to the last commit without creating a new one.

21. **What is \`.gitignore\`?**  
    *Answer:* A text file where you list files and directories that Git should completely ignore and never track (e.g., \`node_modules\`, \`.env\`).

22. **How do you find a bug using Git?**  
    *Answer:* Use \`git bisect\`, which uses a binary search algorithm to quickly find which commit in history introduced a bug.

23. **What is the difference between \`git reset --soft\`, \`--mixed\`, and \`--hard\`?**  
    *Answer:* \`--soft\` undoes the commit but leaves changes staged. \`--mixed\` (default) undoes the commit and leaves changes unstaged in the working directory. \`--hard\` undoes the commit and completely deletes all changes.

24. **What are Git tags?**  
    *Answer:* Tags are reference points to specific points in Git history. They are typically used to mark release points (e.g., \`v1.0.0\`).

25. **You made changes on \`main\` but meant to make them on a new feature branch. How do you fix it without losing work?**  
    *Answer:* Create the new branch (\`git branch feature\`), reset main back one commit (\`git reset --soft HEAD~1\`), switch to the new branch (\`git switch feature\`), and commit there.

---

## 23. 20 Tricky Git & GitHub Interview Questions

1. **If I delete a local branch using \`git branch -D\`, are the commits on that branch deleted immediately?**  
   *Answer:* No. The commits become "dangling" or "orphaned" because no branch points to them anymore. They remain in the \`.git\` folder until Git's garbage collection runs (usually 30 days). They can be recovered using \`git reflog\`.

2. **You accidentally ran \`git reset --hard\` and lost your unpushed commits. Can you get them back?**  
   *Answer:* Yes, using \`git reflog\`. Reflog tracks every time HEAD moves. You can find the hash of the lost commit in the reflog and do \`git reset --hard <lost-hash>\` to get it back.

3. **Can you commit an empty directory in Git?**  
   *Answer:* No. Git tracks file content, not directories. To commit an empty directory, you must place a hidden file inside it, typically named \`.gitkeep\`.

4. **How do you merge a specific file from another branch without merging the entire branch?**  
   *Answer:* Use \`git checkout\`. While on your current branch, run: \`git checkout source-branch -- path/to/file.txt\`. This brings the file from the source branch into your working directory.

5. **You amended a commit and force-pushed it. A teammate had already pulled the old commit. What happens when they try to pull again?**  
   *Answer:* Their local Git will try to merge the old commit with your newly rewritten commit, resulting in messy duplicate commits or conflicts. Never amend or rebase commits that others have pulled.

6. **What is the difference between \`HEAD~2\` and \`HEAD^2\`?**  
   *Answer:* \`HEAD~2\` means "go back 2 generations following the first parent" (the commit before the commit before HEAD). \`HEAD^2\` means "the second parent of the current commit" (only applicable to merge commits, which have multiple parents).

7. **How do you create a commit that contains absolutely no changes?**  
   *Answer:* Run \`git commit --allow-empty -m "empty commit"\`. This is sometimes used to trigger CI/CD pipelines.

8. **You have 5 untracked files in your directory. You run \`git reset --hard\`. What happens to those 5 files?**  
   *Answer:* Nothing. \`git reset --hard\` only affects files that Git is tracking. Untracked files are ignored by this command. (To remove them, you need \`git clean -fd\`).

9. **How do you change the author of a commit deep in the history?**  
   *Answer:* You must do an interactive rebase (\`git rebase -i\`). Mark the commit as \`edit\`, then run \`git commit --amend --author="New Name <email@example.com>"\`, and finally \`git rebase --continue\`.

10. **Can you squash commits after they have been merged to \`main\` and pushed?**  
    *Answer:* Technically yes, but you absolutely shouldn't. Squashing rewrites history. If you force-push rewritten history to \`main\`, you will break the repository for every other developer.

11. **When you run \`git fetch\`, where do the downloaded commits go if they aren't merged?**  
    *Answer:* They are stored in your local repository under "remote-tracking branches" (e.g., \`origin/main\`). You can inspect them by checking out \`origin/main\` before merging them into your local \`main\`.

12. **How do you rename a local branch and push the new name to the remote?**  
    *Answer:* First, rename locally: \`git branch -m old-name new-name\`. Second, delete the old remote branch: \`git push origin --delete old-name\`. Finally, push the new branch: \`git push -u origin new-name\`.

13. **What happens if you add \`.gitignore\` to the \`.gitignore\` file?**  
    *Answer:* Git will stop tracking *future* changes to the \`.gitignore\` file itself, but the current \`.gitignore\` rules will still apply. (This is generally a bad practice).

14. **What's the difference between \`git merge --squash\` and squashing via \`git rebase -i\`?**  
    *Answer:* \`merge --squash\` takes all commits from a feature branch and places them as a *single new commit* on the target branch without creating a merge tie. \`rebase -i\` rewrites the history of the feature branch itself to combine the commits *before* merging.

15. **Your \`git push\` is rejected because the remote has commits you don't have. You know their commits are wrong and you want your local branch to completely overwrite the remote. How?**  
    *Answer:* Use \`git push --force\` (or \`--force-with-lease\`). This tells the remote server to discard its history and exactly match your local history.

16. **You accidentally ran \`git add .\` and staged a massive 5GB video file. How do you unstage it without deleting it from your computer?**  
    *Answer:* Run \`git restore --staged <video-file>\` (or \`git reset HEAD <video-file>\`).

17. **Why is \`git revert\` preferred over \`git reset\` in a shared repository?**  
    *Answer:* \`git reset\` deletes commits from history. If someone else has already pulled those commits, it causes massive synchronization issues. \`git revert\` leaves the old commits untouched and simply adds a *new* commit that negates the changes, making it 100% safe to share.

18. **You pop a stash and it results in a merge conflict. After resolving it, the stash is still in your stash list. Why?**  
    *Answer:* \`git stash pop\` automatically drops the stash *only* if it applies cleanly. If there is a conflict, Git assumes you might need the stash again, so it keeps it. You must run \`git stash drop\` manually after resolving the conflict.

19. **How do you temporarily ignore changes to a file that is already tracked by Git (e.g., a local config file you tweaked)?**  
    *Answer:* Run \`git update-index --assume-unchanged <file>\`. Git will stop checking that file for modifications. (To track it again: \`--no-assume-unchanged\`).

20. **You create \`feature-B\` branching off \`feature-A\`. You merge \`feature-A\` into \`main\`. What happens to \`feature-B\`?**  
    *Answer:* \`feature-B\` still contains all the commits of \`feature-A\` plus its own commits. When you try to merge \`feature-B\` into \`main\`, Git is smart enough to see that the \`feature-A\` commits are already in \`main\`, and it will only apply the new commits unique to \`feature-B\`.

`;

const mdPath = path.join(__dirname, 'src', 'Git_GitHub_Complete_Notes.md');
let content = fs.readFileSync(mdPath, 'utf-8');

// The footer we want to replace
const footerText = '---\n\n*Made with ❤️ — These notes cover everything from absolute basics to real team workflows. Practice by building real projects — there\'s no better teacher than git-ing your hands dirty.*';

if (content.includes(footerText)) {
  content = content.replace(footerText, qaContent + '\\n' + footerText);
  fs.writeFileSync(mdPath, content, 'utf-8');
  console.log('Successfully added 45 QA scenarios!');
} else {
  // Try slightly different whitespace matching if exact fails
  const parts = content.split('---');
  if (parts.length > 1) {
    const lastPart = parts.pop();
    if (lastPart.includes('Made with ❤️')) {
      const newContent = parts.join('---') + qaContent + '\\n---\\n' + lastPart;
      fs.writeFileSync(mdPath, newContent, 'utf-8');
      console.log('Successfully added 45 QA scenarios via fallback split!');
    } else {
      console.error('Footer found but missing heart text');
    }
  } else {
    console.error('Could not find the footer separator ---');
  }
}
