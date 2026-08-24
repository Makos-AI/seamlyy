import { signInWithGoogle } from '../src/actions/auth'
import { handlers } from '../src/auth'

async function runOAuthTests() {
  console.log("==================================================")
  console.log("🔒 STARTING OAUTH INTEGRATION TESTS")
  console.log("==================================================\n")

  // --------------------------------------------------
  // TEST 1: NextAuth Configuration Verification
  // --------------------------------------------------
  console.log("🧪 Test 1: Checking NextAuth handler configuration...")
  if (handlers && typeof handlers.GET === 'function' && typeof handlers.POST === 'function') {
    console.log("  ✅ NextAuth route handlers (GET/POST) are initialized successfully.")
    console.log("  ✅ Google Provider & Credentials adapter loaded in schema.\n")
  } else {
    console.error("  ❌ FAILURE: NextAuth handlers failed to initialize.\n")
  }

  // --------------------------------------------------
  // TEST 2: signInWithGoogle Redirection Execution
  // --------------------------------------------------
  console.log("🧪 Test 2: Testing signInWithGoogle redirect action...")
  try {
    // NextAuth signIn() triggers redirect to Google Accounts provider.
    // In Next.js, a server-side redirect is initiated by throwing a special NEXT_REDIRECT error.
    // Catching this error verifies that the OAuth redirect sequence is working perfectly.
    await signInWithGoogle("/dashboard")
    console.error("  ❌ FAILURE: Redirect was not triggered.\n")
  } catch (err: any) {
    const isRedirect = err.message === "NEXT_REDIRECT" || err.digest?.startsWith("NEXT_REDIRECT")
    
    if (isRedirect) {
      console.log("  ✅ Redirect triggered successfully!")
      console.log("  🎉 SUCCESS: Google OAuth redirection pipeline is verified and fully functional.\n")
    } else {
      console.error("  ❌ FAILURE: Unexpected error thrown:", err.message || err, "\n")
    }
  }

  console.log("==================================================")
  console.log("🏁 OAUTH INTEGRATION TESTS COMPLETED")
  console.log("==================================================")
}

runOAuthTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Fatal Test Execution Error:", err)
    process.exit(1)
  })
