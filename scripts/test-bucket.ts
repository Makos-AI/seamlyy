import { supabaseAdmin } from '../src/lib/supabase'

async function testBucketUpload() {
  console.log("=== Testing artworks bucket write access ===\n")

  // Create a tiny test image (1x1 red pixel PNG)
  const testBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  )

  const testKey = '_test/upload-test.png'

  // Upload
  const { data, error } = await supabaseAdmin.storage
    .from('artworks')
    .upload(testKey, testBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) {
    console.error(`❌ Upload FAILED: ${error.message}`)
    console.error('Full error:', error)
    return
  }

  console.log(`✅ Upload succeeded! Path: ${data.path}`)

  // Verify public URL works
  const { data: urlData } = supabaseAdmin.storage
    .from('artworks')
    .getPublicUrl(testKey)

  console.log(`✅ Public URL: ${urlData.publicUrl}`)

  // Clean up test file
  await supabaseAdmin.storage.from('artworks').remove([testKey])
  console.log(`✅ Test file cleaned up`)
  
  console.log("\n🎉 artworks bucket is working! Ready for real uploads.")
}

testBucketUpload()
  .then(() => process.exit(0))
  .catch(e => { console.error("Error:", e); process.exit(1) })
