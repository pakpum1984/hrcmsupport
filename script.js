// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4VAhT9Bp7-_P0s4UOQlJMEK1bxn2770w",
    authDomain: "bookcarcm.firebaseapp.com",
    databaseURL: "https://bookcarcm-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bookcarcm",
    storageBucket: "bookcarcm.firebasestorage.app",
    messagingSenderId: "540662345211",
    appId: "1:540662345211:web:0e4dbf2ee2516a267c6f5e",
    measurementId: "G-V748ZCZZP5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ฟังก์ชันปิด Cookie Consent
function closepageacceptAllCookies() {
    document.getElementById("cookieConsent").style.display = "none";
}

// ตรวจสอบและแสดง Cookie Consent
function checkCookieConsent() {
    if (!localStorage.getItem('cookieAccepted')) {
        document.getElementById("cookieConsent").style.display = "block";
    }
}

// บันทึกการตั้งค่าคุกกี้
document.getElementById("saveCookieSettings")?.addEventListener("click", function() {
    const settings = {
        essentialCookies: "on",
        analyticsCookies: document.getElementById("analyticsCookies").checked ? "on" : "off",
        marketingCookies: document.getElementById("marketingCookies").checked ? "on" : "off"
    };
    localStorage.setItem("cookieSettings", JSON.stringify(settings));
    localStorage.setItem("cookieAccepted", "true");
    $('#cookieSettingsModal').modal('hide');
    document.getElementById("cookieConsent").style.display = "none";
});

// ยอมรับคุกกี้ทั้งหมด
document.getElementById("acceptAllCookies")?.addEventListener("click", function() {
    document.getElementById("analyticsCookies").checked = true;
    document.getElementById("marketingCookies").checked = true;
    document.getElementById("saveCookieSettings").click();
});

// ฟังก์ชันจัดรูปแบบวันที่
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    try {
        let date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear() + 543;
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
}

// ฟังก์ชันเรียงลำดับ jobs
function sortJobs(jobs) {
    // นับจำนวนการ์ดในแต่ละแผนก
    const departmentCount = {};
    jobs.forEach(job => {
        const dept = job.แผนก;
        departmentCount[dept] = (departmentCount[dept] || 0) + 1;
    });
    
    // เรียงตาม:
    // 1. สถานะ "เปิดรับสมัคร ด่วน!!!" ขึ้นก่อน
    // 2. เรียงตามแผนกที่มีจำนวนการ์ดมากที่สุดก่อน
    // 3. เรียงตามวันที่ (ใหม่สุดก่อน)
    
    return jobs.sort((a, b) => {
        // 1. ตรวจสอบสถานะด่วนก่อน
        const aUrgent = a.สถานะ === 'เปิดรับสมัคร ด่วน!!!' ? 1 : 0;
        const bUrgent = b.สถานะ === 'เปิดรับสมัคร ด่วน!!!' ? 1 : 0;
        
        if (aUrgent !== bUrgent) {
            return bUrgent - aUrgent; // ด่วนขึ้นก่อน
        }
        
        // 2. เรียงตามแผนกที่มีจำนวนการ์ดมากที่สุดก่อน
        const aCount = departmentCount[a.แผนก] || 0;
        const bCount = departmentCount[b.แผนก] || 0;
        
        if (aCount !== bCount) {
            return bCount - aCount; // แผนกที่มีการ์ดมากขึ้นก่อน
        }
        
        // 3. ถ้าจำนวนการ์ดเท่ากัน เรียงตามวันที่ (ใหม่สุดก่อน)
        return (b.วันที่และเวลาที่ลงประกาศ || 0) - (a.วันที่และเวลาที่ลงประกาศ || 0);
    });
}

// ฟังก์ชันสร้างการ์ดงาน
function createJobCard(job, index, type) {
    const statusClass = job['สถานะ'] === 'เปิดรับสมัคร ด่วน!!!' ? 'urgent' : 'normal';
    const statusText = job['สถานะ'] === 'เปิดรับสมัคร ด่วน!!!' ? 'ด่วน!!!' : 'เปิดรับสมัคร';
    
    return `
        <div class="col-lg-12">
            <div class="job-card">
                <div class="job-header ${type}">
                    <div class="job-number">${index}</div>
                    <h4 class="job-title">${job['ตำแหน่งงาน'] || '-'}</h4>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="job-status ${statusClass}">
                            <i class="fas fa-${job['สถานะ'] === 'เปิดรับสมัคร ด่วน!!!' ? 'exclamation-circle' : 'check-circle'} me-1"></i>
                            ${statusText}
                        </span>
                    </div>
                </div>
                <div class="job-body">
                    <div class="job-info">
                        <div class="job-info-item ${type}">
                            <i class="fas fa-user-tag"></i>
                            <span><strong>ประเภท:</strong> ${job['ตำแหน่ง'] || '-'}</span>
                        </div>
                        <div class="job-info-item ${type}">
                            <i class="fas fa-users"></i>
                            <span><strong>จำนวน:</strong> ${job['จำนวน'] || '0'} อัตรา</span>
                        </div>
                        <div class="job-info-item ${type}">
                            <i class="fas fa-building"></i>
                            <span><strong>แผนก:</strong> ${job['แผนก'] || '-'}</span>
                        </div>
                        <div class="job-info-item ${type}">
                            <i class="fas fa-birthday-cake"></i>
                            <span><strong>อายุ:</strong> ${job['อายุ'] || '-'} ปีขึ้นไป</span>
                        </div>
                        <div class="job-info-item ${type}">
                            <i class="fas fa-ruler-vertical"></i>
                            <span><strong>ส่วนสูง:</strong> ${job['ส่วนสูง'] || '-'}</span>
                        </div>
                        <div class="job-info-item ${type}">
                            <i class="fas fa-graduation-cap"></i>
                            <span><strong>วุฒิ:</strong> ${job['วุฒิการศึกษา'] || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="job-description">
                        <div class="mb-2">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            <strong>คุณสมบัติ:</strong> ${job['คุณสมบัติ'] || '-'}
                        </div>
                        <div>
                            <i class="fas fa-info-circle text-info me-2"></i>
                            <strong>ลักษณะงาน:</strong> ${job['อื่นๆ'] || '-'}
                        </div>
                    </div>
                    
                    <div class="job-footer">
                        <span>
                            <i class="fas fa-user-edit me-1"></i>
                            ${job['ผู้ลงประกาศ'] || '-'}
                        </span>
                        <span>
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${formatDateTime(job['วันที่และเวลาที่ลงประกาศ'])}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== ระบบนับผู้เยี่ยมชมแบบที่ 1: visitorCount (แบบง่าย) ==========
function updateVisitorCount() {
    const visitorRef = database.ref('visitorCount');
    
    visitorRef.transaction(currentCount => {
        return (currentCount || 0) + 1;
    }, (error, committed, snapshot) => {
        if (error) {
            console.error('Transaction failed:', error);
            let localCount = localStorage.getItem('visitorCount') || 0;
            localCount = parseInt(localCount) + 1;
            localStorage.setItem('visitorCount', localCount);
        }
    });
}

function getCurrentVisitorCount() {
    const visitorRef = database.ref('visitorCount');
    
    visitorRef.once('value', snapshot => {
        const count = snapshot.val() || 0;
        $('#visitor-count').text('ผู้เยี่ยมชมทั้งหมด: ' + count.toLocaleString() + ' คน');
    }).catch(error => {
        console.error('Error getting visitor count:', error);
        let localCount = localStorage.getItem('visitorCount') || 0;
        $('#visitor-count').text('ผู้เยี่ยมชมทั้งหมด: ' + localCount.toLocaleString() + ' คน');
    });
}

// ========== ระบบนับผู้เยี่ยมชมแบบที่ 2: visitorStats (แบบละเอียด) ==========
function updateDetailedVisitorCount() {
    const visitorRef = database.ref('visitorStats');
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    const year = today.substring(0, 4);
    
    // อัพเดท total
    visitorRef.child('total').transaction(current => (current || 0) + 1);
    
    // อัพเดท daily
    visitorRef.child('daily').child(today).transaction(current => (current || 0) + 1);
    
    // อัพเดท monthly
    visitorRef.child('monthly').child(month).transaction(current => (current || 0) + 1);
    
    // อัพเดท yearly
    visitorRef.child('yearly').child(year).transaction(current => (current || 0) + 1);
}

function displayDetailedVisitorStats() {
    const visitorRef = database.ref('visitorStats');
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    const year = today.substring(0, 4);
    
    // แสดงจำนวนรวม
    visitorRef.child('total').once('value', snapshot => {
        const total = snapshot.val() || 0;
        $('#visitor-count').html(`
            <i class="fas fa-users me-2"></i>
            ผู้เยี่ยมชมทั้งหมด: ${total.toLocaleString()} คน
        `);
    }).catch(error => {
        console.error('Error getting total count:', error);
    });
    
    // แสดงจำนวนวันนี้
    visitorRef.child('daily').child(today).once('value', snapshot => {
        const todayCount = snapshot.val() || 0;
        $('#visitor-today').html(`
            <i class="fas fa-calendar-day me-1"></i>
            วันนี้: ${todayCount.toLocaleString()} คน
        `);
    }).catch(error => {
        console.error('Error getting today count:', error);
        $('#visitor-today').html(`
            <i class="fas fa-calendar-day me-1"></i>
            วันนี้: 0 คน
        `);
    });
    
    // แสดงจำนวนเดือนนี้
    visitorRef.child('monthly').child(month).once('value', snapshot => {
        const monthCount = snapshot.val() || 0;
        $('#visitor-month').html(`
            <i class="fas fa-calendar-alt me-1"></i>
            เดือนนี้: ${monthCount.toLocaleString()} คน
        `);
    }).catch(error => {
        console.error('Error getting month count:', error);
        $('#visitor-month').html(`
            <i class="fas fa-calendar-alt me-1"></i>
            เดือนนี้: 0 คน
        `);
    });
    
    // แสดงจำนวนปีนี้
    visitorRef.child('yearly').child(year).once('value', snapshot => {
        const yearCount = snapshot.val() || 0;
        $('#visitor-year').html(`
            <i class="fas fa-calendar me-1"></i>
            ปีนี้: ${yearCount.toLocaleString()} คน
        `);
    }).catch(error => {
        console.error('Error getting year count:', error);
        $('#visitor-year').html(`
            <i class="fas fa-calendar me-1"></i>
            ปีนี้: 0 คน
        `);
    });
}

// Smooth scroll สำหรับลิงก์
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// เปลี่ยนสี Navbar เมื่อ scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar-modern');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// เรียกใช้เมื่อหน้าโหลด
$(document).ready(function() {
    checkCookieConsent();
    
    // ตรวจสอบว่านับผู้เยี่ยมชมใน session นี้หรือยัง
    if (!sessionStorage.getItem('visitorCounted')) {
        // รอให้ Firebase พร้อมทำงาน
        setTimeout(() => {
            // อัพเดททั้งสองระบบ
            updateVisitorCount();        // อัพเดท visitorCount
            updateDetailedVisitorCount(); // อัพเดท visitorStats
        }, 500);
        
        // บันทึก session
        sessionStorage.setItem('visitorCounted', 'true');
    }
    
    // แสดงสถิติแบบละเอียด (ใช้ได้ทั้งก่อนและหลังนับ)
    setTimeout(() => {
        displayDetailedVisitorStats();
    }, 500);
    
    $('#card-container-day, #card-container-day-disabled, #card-container-month').html('<div class="spinner-container"><div class="custom-spinner"></div></div>');
    
    // ดึงข้อมูลจาก Firebase
    database.ref('jobs').once('value', snapshot => {
        $('#jobs-loading').hide();
        $('#jobs-content').show();
        
        $('#card-container-day, #card-container-day-disabled, #card-container-month').empty();
        
        const jobs = [];
        snapshot.forEach(childSnapshot => {
            jobs.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // กรองเฉพาะ jobs ที่เปิดรับสมัคร (ไม่แสดง jobs ที่ปิดรับสมัคร)
        const openJobs = jobs.filter(job => job.สถานะ !== 'ปิดรับสมัคร');
        
        // แยก jobs ตามประเภท
        const dailyJobs = openJobs.filter(job => job.ตำแหน่ง === 'รายวัน');
        const monthlyJobs = openJobs.filter(job => job.ตำแหน่ง === 'รายเดือน');
        const disabledJobs = openJobs.filter(job => job.ตำแหน่ง === 'รายวัน-คนพิการ');
        
        // อัปเดตตัวเลขใน Stats Cards
        const dailyTotalPositions = dailyJobs.reduce((sum, job) => sum + (parseInt(job.จำนวน) || 0), 0);
        const monthlyTotalPositions = monthlyJobs.reduce((sum, job) => sum + (parseInt(job.จำนวน) || 0), 0);
        const disabledTotalPositions = disabledJobs.reduce((sum, job) => sum + (parseInt(job.จำนวน) || 0), 0);
        
        $('#daily-count').text(`${dailyJobs.length} ตำแหน่ง (${dailyTotalPositions} อัตรา)`);
        $('#monthly-count').text(`${monthlyJobs.length} ตำแหน่ง (${monthlyTotalPositions} อัตรา)`);
        $('#daily-disabled-count').text(`${disabledJobs.length} ตำแหน่ง (${disabledTotalPositions} อัตรา)`);
        
        // เรียงลำดับ jobs ตามเงื่อนไข
        const sortedDailyJobs = sortJobs([...dailyJobs]);
        const sortedMonthlyJobs = sortJobs([...monthlyJobs]);
        const sortedDisabledJobs = sortJobs([...disabledJobs]);
        
        // แสดง Daily Jobs
        if (sortedDailyJobs.length > 0) {
            $('#card-container-day1').hide();
            sortedDailyJobs.forEach((job, index) => {
                $('#card-container-day').append(createJobCard(job, index + 1, 'daily'));
            });
        } else {
            $('#card-container-day').hide();
            $('#card-container-day1').show();
        }
        
        // แสดง Monthly Jobs
        if (sortedMonthlyJobs.length > 0) {
            $('#card-container-month1').hide();
            sortedMonthlyJobs.forEach((job, index) => {
                $('#card-container-month').append(createJobCard(job, index + 1, 'monthly'));
            });
        } else {
            $('#card-container-month').hide();
            $('#card-container-month1').show();
        }
        
        // แสดง Disabled Jobs
        if (sortedDisabledJobs.length > 0) {
            $('#card-container-day-disabled1').hide();
            sortedDisabledJobs.forEach((job, index) => {
                $('#card-container-day-disabled').append(createJobCard(job, index + 1, 'disabled'));
            });
        } else {
            $('#card-container-day-disabled').hide();
            $('#card-container-day-disabled1').show();
        }
    }).catch(error => {
        console.error('Error loading data from Firebase:', error);
        $('#jobs-loading').html('<p class="text-center text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>');
    });
});
