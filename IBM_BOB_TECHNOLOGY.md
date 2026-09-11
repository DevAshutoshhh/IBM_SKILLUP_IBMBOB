# How IBM Bob was used in SaathiSetu

SaathiSetu – Scholarship and Education Scheme Readiness Navigator existed before I began using IBM
Bob. I imported the existing React, TypeScript, and Vite repository into the IBM Bob IDE; I did not
ask Bob to generate the original application or choose the problem for me.

I first used Bob to initialise the project context and understand how the codebase was organised.
This included tracing the application shell and screens, the shared state provider, browser storage,
the English/Hindi translation layer, and the separation between interface code and the matching and
document-readiness utilities. Bob's code explanations made it easier to follow how profile answers
flow into transparent match factors and how checklist statuses become a readiness score.

I then used Bob to review the existing implementation. The review covered the main student journey,
privacy controls, demonstration-data warnings, official-source links, keyboard-oriented interface
patterns, print styles, PWA files, tests, and deployment setup. Bob also supported genuine
development, improvement, and debugging activities that helped bring the imported project to its
current state. The repository does not preserve enough session-level evidence to assign a particular
named feature solely to Bob, so I have deliberately not made that narrower claim.

Testing and build verification were an important part of the workflow. Bob was used while checking
the project, and the final repository audit independently repeated the reproducible commands. The
lockfile installation completed, TypeScript checking succeeded, all 77 tests in five files passed,
and both the standard production build and the GitHub Pages build completed. The Pages build uses
the actual repository name, `IBM_SKILLUP_IBMBOB`, so its assets resolve correctly under the project
site path. Hash-based navigation remains in place so routed views can be refreshed on static hosting.

Bob also supported documentation work. The resulting documentation explains the product, its
technical structure, its local-only privacy model, the fact that the opportunity records are
illustrative, the verification commands, and the remaining GitHub Pages setup step. The Bob record
separates confirmed activities from details that are not preserved, such as exact session names,
dates, or screenshot filenames.

In this project, IBM Bob acted as a collaborative development assistant throughout the improvement
path from the imported codebase to the current project. It helped me inspect the code, question
implementation details, review quality, develop and debug improvements, verify the project, and
communicate the result more clearly. I remained responsible for selecting the student-support
problem, making product decisions, defining the privacy principles, deciding which suggestions to
accept, and completing the final review. Bob accelerated and contributed to the improvement
workflow, while ownership and judgement remained with me.
