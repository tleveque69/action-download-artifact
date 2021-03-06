# Download workflow artifact GitHub Action

An action that downloads and extracts uploaded artifact associated with given workflow and commit.

Let's suppose you have a workflow with a job in it that at the end uploads an artifact using `actions/upload-artifact` action and you want to download this artifact in another workflow that is run after the first one. Official `actions/download-artifact` does not allow this. That's why I decided to create this action. By knowing only the workflow name and commit SHA, you can download the previously uploaded artifact from different workflow associated with that commit and use it.

## Usage

> If `commit` or `pr` or `branch` is not specified then the artifact from the most recent completed workflow run will be downloaded.
> If `branch` is specified, it will ignore any value set for `commit` and `pr`.

```yaml
- name: Download artifact
  uses: dawidd6/action-download-artifact@v2
  with:
    # Optional, GitHub token
    github_token: ${{secrets.GITHUB_TOKEN}}
    # Required, workflow file name or ID
    workflow: workflow_name.yml
    # Optional, will get head commit SHA
    pr: ${{github.event.pull_request.number}}
    # Optional, no need to specify if PR is
    commit: ${{github.event.pull_request.head.sha}}
    # Optional, will use the branch
    branch: master
    # Optional, uploaded artifact name,
    # will download all artifacts if not specified
    # and extract them in respective subdirectories
    # https://github.com/actions/download-artifact#download-all-artifacts
    name: artifact_name
    # Optional, directory where to extract artifact
    path: extract_here
    # Optional, defaults to current repo
    repo: ${{github.repository}}
```
