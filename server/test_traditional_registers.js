const API_BASE = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('Testing Traditional Hostel Management System Registers');
  console.log('====================================================\n');

  let adminCookie = '';
  let studentCookie = '';

  // 1. ADMIN AUTHENTICATION
  console.log('[TEST 1] Admin Authentication');
  const adminLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'demo@admin.in', password: 'admin123', role: 'admin' })
  });
  if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${adminLoginRes.status}`);
  adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log('✓ Admin authenticated successfully\n');

  // 2. FEATURE 1: STUDENT ADMISSION REGISTER
  console.log('[TEST 2] Feature 1: Student Admission Register');
  const admissionsRes = await fetch(`${API_BASE}/api/registers/admissions`, {
    headers: { Cookie: adminCookie }
  });
  const admissionsData = await admissionsRes.json();
  console.log(`✓ Fetched admission register: ${admissionsData.total} residents`);

  // Direct admission
  const newStudentRes = await fetch(`${API_BASE}/api/registers/admissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      name: 'Pooja Sharma',
      email: `pooja_${Date.now()}@example.com`,
      phone: '+91 98765 11223',
      room: 'B-201',
      bed: '1',
      guardianName: 'Sunil Sharma',
      guardianPhone: '+91 98111 22334',
      college: 'Delhi University',
      course: 'B.Sc Physics',
      yearOfStudy: '2nd Year',
      documentStatus: 'Verified'
    })
  });
  const newStudentData = await newStudentRes.json();
  if (!newStudentRes.ok) throw new Error(`Direct admission failed: ${JSON.stringify(newStudentData)}`);
  console.log(`✓ Direct admission registered: ${newStudentData.student.name} (${newStudentData.student.admissionNumber})`);

  // Update admission record
  const updateAdmRes = await fetch(`${API_BASE}/api/registers/admissions/${newStudentData.student._id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ documentStatus: 'Verified', bed: '2' })
  });
  const updateAdmData = await updateAdmRes.json();
  console.log(`✓ Admission updated: Document status = ${updateAdmData.student.documentStatus}\n`);

  // 3. FEATURE 2: RENT & PAYMENT LEDGER
  console.log('[TEST 3] Feature 2: Rent and Payment Ledger');
  // Record Cash Payment (MUST NOT be automatically bank verified)
  const cashPayRes = await fetch(`${API_BASE}/api/registers/ledger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      studentId: newStudentData.student._id,
      paymentType: 'Monthly Rent',
      forMonth: '2026-09',
      amountDue: 15000,
      amountPaid: 8000,
      paymentMode: 'Cash',
      notes: 'Cash received at front desk'
    })
  });
  const cashPayData = await cashPayRes.json();
  if (!cashPayRes.ok) throw new Error(`Cash payment record failed: ${JSON.stringify(cashPayData)}`);
  const cashEntry = cashPayData.ledgerEntry;
  if (!cashEntry.isCash || cashEntry.isVerified) {
    throw new Error('CRITICAL RULE VIOLATION: Cash payment was erroneously marked as bank verified!');
  }
  console.log(`✓ Cash payment recorded: Receipt ${cashEntry.receiptNumber}, Due: ₹${cashEntry.amountDue}, Paid: ₹${cashEntry.amountPaid}, Balance: ₹${cashEntry.balance}, isCash: ${cashEntry.isCash}, isVerified: ${cashEntry.isVerified}`);

  // Record Bank/UPI Payment (isVerified: true)
  const upiPayRes = await fetch(`${API_BASE}/api/registers/ledger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      studentId: newStudentData.student._id,
      paymentType: 'Security Deposit',
      forMonth: '2026-09',
      amountDue: 10000,
      amountPaid: 10000,
      paymentMode: 'UPI / Online',
      transactionRef: 'UPI-REF-99887766'
    })
  });
  const upiPayData = await upiPayRes.json();
  const upiEntry = upiPayData.ledgerEntry;
  console.log(`✓ Bank/UPI payment recorded: Receipt ${upiEntry.receiptNumber}, Ref: ${upiEntry.transactionRef}, isVerified: ${upiEntry.isVerified}`);

  // Fetch Printable Receipt
  const receiptRes = await fetch(`${API_BASE}/api/registers/ledger/${cashEntry._id}/receipt`, {
    headers: { Cookie: adminCookie }
  });
  const receiptData = await receiptRes.json();
  console.log(`✓ Printable receipt retrieved: ${receiptData.receipt.receiptNumber} for ${receiptData.receipt.studentName} at ${receiptData.hostel.name}\n`);

  // 4. FEATURE 3: VISITOR & OUTPASS REGISTER
  console.log('[TEST 4] Feature 3: Visitor & Outpass Register');
  // Log Visitor Entry
  const visitorRes = await fetch(`${API_BASE}/api/registers/visitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      visitorName: 'Vikas Sharma',
      visitorPhone: '+91 98222 33445',
      studentName: newStudentData.student.name,
      studentRoom: newStudentData.student.room,
      purpose: 'Delivering luggage & books',
      relation: 'Brother'
    })
  });
  const visitorData = await visitorRes.json();
  console.log(`✓ Visitor entry logged: ${visitorData.visitor.visitorName} visiting Room ${visitorData.visitor.studentRoom}`);

  // Mark Visitor Exit
  const exitRes = await fetch(`${API_BASE}/api/registers/visitors/${visitorData.visitor._id}/exit`, {
    method: 'PATCH',
    headers: { Cookie: adminCookie }
  });
  const exitData = await exitRes.json();
  console.log(`✓ Visitor exit logged: Status = ${exitData.visitor.status}`);

  // Create Outpass Request
  const outpassRes = await fetch(`${API_BASE}/api/registers/outpasses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      studentId: newStudentData.student._id,
      destination: 'Central Mall & Book Depot',
      reason: 'Purchasing academic textbooks',
      departureTime: new Date(),
      expectedReturnTime: new Date(Date.now() + 3600000 * 3)
    })
  });
  const outpassData = await outpassRes.json();
  console.log(`✓ Outpass requested: ${outpassData.outpass.outpassNumber} (Status: ${outpassData.outpass.status})`);

  // Warden Approves Outpass
  const approveOpRes = await fetch(`${API_BASE}/api/registers/outpasses/${outpassData.outpass._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ action: 'approve' })
  });
  const approveOpData = await approveOpRes.json();
  console.log(`✓ Outpass approved by warden: Status = ${approveOpData.outpass.status}, ApprovedBy = ${approveOpData.outpass.approvedBy}\n`);

  // 5. FEATURE 4: MESS & MEAL REGISTER
  console.log('[TEST 5] Feature 4: Mess & Meal Register');
  const messMenuRes = await fetch(`${API_BASE}/api/registers/mess/menu`, {
    headers: { Cookie: adminCookie }
  });
  const messMenuData = await messMenuRes.json();
  console.log(`✓ Fetched weekly mess timetable: ${messMenuData.menus.length} days scheduled`);

  // Update Tuesday Menu
  const updateMenuRes = await fetch(`${API_BASE}/api/registers/mess/menu/Tuesday`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      breakfast: 'Masala Dosa, Sambar, Coconut Chutney',
      lunch: 'Chole, Bhature, Steamed Rice, Boondi Raita',
      snacks: 'Filter Coffee & Veg Cutlet',
      dinner: 'Mix Veg Korma, Butter Roti, Dal Fry',
      specialItem: 'Rasgulla'
    })
  });
  const updateMenuData = await updateMenuRes.json();
  console.log(`✓ Tuesday menu updated: Special = ${updateMenuData.menu.specialItem}`);

  // Attendance
  const attendRes = await fetch(`${API_BASE}/api/registers/mess/attendance`, {
    headers: { Cookie: adminCookie }
  });
  const attendData = await attendRes.json();
  console.log(`✓ Mess attendance fetched: Breakfast: ${attendData.counts.breakfastCount}, Lunch: ${attendData.counts.lunchCount}, Dinner: ${attendData.counts.dinnerCount}\n`);

  // 6. FEATURE 5: COMPLAINT & MAINTENANCE REGISTER
  console.log('[TEST 6] Feature 5: Complaint & Maintenance Register');
  const complaintRes = await fetch(`${API_BASE}/api/registers/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      studentId: newStudentData.student._id,
      category: 'Electricity',
      title: 'Ceiling fan making clicking sound',
      description: 'Regulator operates on high speed only; clicking noise at night',
      priority: 'Medium'
    })
  });
  const complaintData = await complaintRes.json();
  console.log(`✓ Complaint registered: ${complaintData.complaint.complaintNumber} (${complaintData.complaint.category})`);

  // Assign staff and resolve
  const resolveRes = await fetch(`${API_BASE}/api/registers/complaints/${complaintData.complaint._id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      status: 'Resolved',
      assignedStaff: 'Ramesh (Electrician)',
      resolutionDetails: 'Capacitor and regulator replaced. Tested smoothly.'
    })
  });
  const resolveData = await resolveRes.json();
  console.log(`✓ Complaint updated: Status = ${resolveData.complaint.status}, AssignedStaff = ${resolveData.complaint.assignedStaff}\n`);

  // 7. FEATURE 6: DIGITAL NOTICE BOARD
  console.log('[TEST 7] Feature 6: Digital Notice Board');
  const noticeRes = await fetch(`${API_BASE}/api/registers/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      title: 'Bi-Annual Fire Safety & Evacuation Drill',
      message: 'All residents are advised that mandatory fire drill will be conducted Saturday 11 AM.',
      category: 'Rules & Regulation',
      audience: 'All residents',
      isImportant: true,
      expiryDate: new Date(Date.now() + 86400000 * 7)
    })
  });
  const noticeData = await noticeRes.json();
  console.log(`✓ Circular posted to notice board: "${noticeData.notice.title}" (${noticeData.notice.category})`);

  // Toggle archive
  const archiveRes = await fetch(`${API_BASE}/api/registers/notices/${noticeData.notice._id}/archive`, {
    method: 'PATCH',
    headers: { Cookie: adminCookie }
  });
  const archiveData = await archiveRes.json();
  console.log(`✓ Notice archive status toggled: isArchived = ${archiveData.notice.isArchived}\n`);

  // 8. FEATURE 7 & SECURITY: ROLE-BASED ACCESS & STUDENT ISOLATION
  console.log('[TEST 8] Role-Based Access Control & Student Isolation');
  // Student Login
  const studentLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'ananya@student.in', password: 'student123', role: 'student' })
  });
  if (!studentLoginRes.ok) throw new Error('Student login failed');
  studentCookie = studentLoginRes.headers.get('set-cookie');
  console.log('✓ Student logged in successfully');

  // Student queries ledger (must only see their own transactions)
  const studentLedgerRes = await fetch(`${API_BASE}/api/registers/ledger`, {
    headers: { Cookie: studentCookie }
  });
  const studentLedgerData = await studentLedgerRes.json();
  console.log(`✓ Student ledger query returned ${studentLedgerData.entries.length} personal entries`);
  for (const entry of studentLedgerData.entries) {
    if (entry.studentName !== 'Ananya Mehta') {
      throw new Error(`SECURITY BREACH: Student saw ledger entry for ${entry.studentName}!`);
    }
  }
  console.log('✓ Student ledger data isolation verified (zero records from other students)');

  // Student attempts to view another student\'s receipt (Pooja's cash entry) -> MUST receive 403 Forbidden
  const unauthorizedReceiptRes = await fetch(`${API_BASE}/api/registers/ledger/${cashEntry._id}/receipt`, {
    headers: { Cookie: studentCookie }
  });
  if (unauthorizedReceiptRes.status === 403) {
    console.log('✓ Unauthorized receipt access correctly rejected with 403 Forbidden');
  } else {
    throw new Error(`SECURITY BREACH: Student accessed someone else's receipt with status ${unauthorizedReceiptRes.status}!`);
  }

  // Student attempts to approve an outpass -> MUST receive 403 Forbidden
  const unauthApproveRes = await fetch(`${API_BASE}/api/registers/outpasses/${outpassData.outpass._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ action: 'approve' })
  });
  if (unauthApproveRes.status === 403) {
    console.log('✓ Student denied admin action (outpass approval) with 403 Forbidden');
  } else {
    throw new Error(`SECURITY BREACH: Student executed admin action with status ${unauthApproveRes.status}!`);
  }

  console.log('\n====================================================');
  console.log('ALL 7 TRADITIONAL HOSTEL REGISTER TESTS PASSED (100%)');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\n✗ TEST FAILED:', err);
  process.exit(1);
});
