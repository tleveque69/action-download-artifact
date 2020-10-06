const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require("fs")

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        let branch = core.getInput("branch")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")

        const client = github.getOctokit(token)

        console.log("==> Repo:", owner + "/" + repo)

        if (branch) {
            console.log("==> Branch:", branch)

            if (pr) {
                console.log("==> Branch and PR can not be defined at the same time, ignoring PR:", pr)
                pr = undefined
            }

            if (commit) {
                console.log("==> Branch and Commit can not be defined at the same time, ignoring Commit:", commit)
                commit = undefined
            }
        }

        if (pr) {
            console.log("==> PR:", pr)

            const pull = await client.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
        }

        if (commit) {
            console.log("==> Commit:", commit)
        }

        let run
        let artifact
        const endpoint = "GET /repos/:owner/:repo/actions/workflows/:id/runs"
        const params = {
            owner: owner,
            repo: repo,
            id: workflow,
            branch: branch
        }
        for await (const runs of client.paginate.iterator(endpoint, params)) {
            console.log(runs.data.length)
             run =  runs.data.find((actual) => {
                 console.log('tested run', actual.id)
                 console.log(actual.id == '289123496')
                 if (actual.id == '289123496')
                    return actual
                /*if (commit) {
                    return run.head_sha == commit
                }
                else {
                    // No PR or commit was specified just return the first one.
                    // The results appear to be sorted from API, so the most recent is first.
                    // Just check if workflow run completed.
                    console.log('tested run', run.id)
                    /!*const artifacts = await client.actions.listWorkflowRunArtifacts({
                        owner: owner,
                        repo: repo,
                        run_id: run.id,
                    })
                    artifact = artifacts.data.artifacts.find((artifact) => {
                        return artifact.name == name
                    })
                    if (artifact)
                        return artifact*!/
                    if (run.id == 289123496)
                        return run.status == "completed"
                }*/
            })
            console.log('breaking run',run)
            if (run) {
                break
            }
        }

        console.log("==> Run:", run.id)
        
        let artifacts = await client.actions.listWorkflowRunArtifacts({
            owner: owner,
            repo: repo,
            run_id: run.id,
        })

        // One artifact or all if `name` input is not specified.
        if (name) {
            artifacts = artifacts.data.artifacts.filter((artifact) => {
                return artifact.name == name
            })
        } else {
            artifacts = artifacts.data.artifacts
        }

        for (const artifact of artifacts) {
            console.log("==> Artifact:", artifact.id)

<<<<<<< HEAD
            const size = filesize(artifact.size_in_bytes, { base: 10 })
=======

>>>>>>> adding artifact request in run finder to check if an artifact is in this run

            console.log("==> Downloading:", artifact.name + ".zip", `(${size})`)

            const zip = await client.actions.downloadArtifact({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            })

            const dir = name ? path : pathname.join(path, artifact.name)

            fs.mkdirSync(dir, { recursive: true })

            const adm = new AdmZip(Buffer.from(zip.data))

            adm.getEntries().forEach((entry) => {
                const action = entry.isDirectory ? "creating" : "inflating"
                const filepath = pathname.join(dir, entry.entryName)

                console.log(`  ${action}: ${filepath}`)
            })

            adm.extractAllTo(dir, true)
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
