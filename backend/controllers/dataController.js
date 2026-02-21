// controllers/dataController.js
const sql = require("mssql");
const connection = require("../connection/connection");
const transporter = require("../mailer");
const { generateOTP } = require("../utils");
const dbConfig = require("../config/dbConfig");
const multer = require('multer')
const CryptoJS = require('crypto-js');
const upload = multer({ storage: multer.memoryStorage() });//add in top of the datacontroller page
const path = require("path");
const fs = require("fs");
const otpStorage = {};

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: "harishkumar.s@yjktechnologies.com",
    to: email,
    subject: "Login OTP",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Error sending OTP");
  }
};

// forget Password handler
const forgetPassword = async (req, res) => {
  const { user_code, email_id } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "VE")
      .input("user_code", sql.NVarChar, user_code)
      .input("email_id", sql.NVarChar, email_id)
      .query(`EXEC SP_user_info_hdr @mode,'',@user_code,'','','','','','','',@email_id,'','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      const otp = generateOTP();
      await sendOTP(email_id, otp);

      otpStorage[email_id] = otp;

      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(401).json({ message: "Email not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const Passwords = async (req, res) => {
//   const { email, new_password } = req.body;

//   try {
//     const pool = await connection.connectToDatabase();
//     const result = await pool
//       .request()
//       .input("Email", sql.NVarChar, email)
//       .query("SELECT * FROM tbl_user_info_hdr WHERE email_id = @Email");

//     if (result.recordset.length > 0) {
//       await pool
//         .request()
//         .input("Email", sql.NVarChar, email)
//         .input("NewPassword", sql.NVarChar, new_password)
//         .query("UPDATE tbl_user_info_hdr SET user_password = @NewPassword WHERE email_id = @Email");
//       res.status(200).json({ message: "Password updated successfully" });
//     } else {
//       res.status(401).json({ message: "Email not found" });
//     }
//   } catch (err) {
//     console.error("Error", err);
//     res.status(500).json({ message: err.message||'Internal Server Error'});
//   }
// };

const Passwords = async (req, res) => {
  const { user_code, email_id, user_password } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "UP")
      .input("user_code", sql.NVarChar, user_code)
      .input("email_id", sql.NVarChar, email_id)
      .input("user_password", sql.NVarChar, user_password)
      .query("EXEC SP_user_info_hdr @mode,'',@user_code,'','','',@user_password,'','','',@email_id,'','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

/*const loginn = async (req, res) => {
  const { user_code, user_password } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("user_code", sql.NVarChar, user_code)
      .input("user_password", sql.NVarChar, user_password)
      .query(
        `EXEC [SP_user_info_hdr] 'LUC','@user_code','','','','','','','','','','','','','','','NULL','NULL','NULL','NULL','','','',''`
      );

    if (!result.recordset[0]) {
      return res.status(401).json({ nmessage: " usercode not found" });
    } 
    else {
      
      const user = result.recordset[0]; // Assuming the first record is the user data
      if (!user.user_password){
        return res.status(401).json({ message: "Invalid password" });
      } else {
        return res.status(200).json({ message: "Login successful" });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await sql.close();
  }
};

const loginn = async (req, res) => {
  const { user_code, user_password } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("user_code", sql.NVarChar, user_code)
      .input("user_password", sql.NVarChar, user_password)
      .query(
      "select  user_password from tbl_user_info_hdr where user_code = @user_code and user_password = @user_password "
      );

    if (result.recordset.length === 0) {
      return res.status(200).json({ imessage:result.recordset.length });
     const user = result.recordset.user_password; 
      if (user !== user_password) {
        return res.status(403).json({ message: "Invalid password" });
      } else {
        return res.status(200).json({ message: "Login successful" });
      }
      
    } else {
      return res.status(200).json({ emessage:result.recordset });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await sql.close();
  }
};*/

// const login = async (req, res) => {
//   const { user_code, user_password } = req.body;
//   const secretKey = 'yjk26012024'; 

//   try {
//     // Decrypt user_code and user_password
//     const decryptedUserCode = CryptoJS.AES.decrypt(user_code, secretKey).toString(CryptoJS.enc.Utf8);
//     const decryptedPassword = CryptoJS.AES.decrypt(user_password, secretKey).toString(CryptoJS.enc.Utf8);

//     // Check if the user exists in the database based on decryptedUserCode
//     const pool = await connection.connectToDatabase();
//     const result = await pool
//       .request()
//       .input("mode", sql.NVarChar, "LUC")
//       .input("user_code", sql.NVarChar, decryptedUserCode)
//       .input("user_password", sql.NVarChar, decryptedPassword)
//       .query(`EXEC SP_user_info_hdr 'LUC','',@user_code,'','','',@user_password,'','','','','','','','','','','','','','','','','',''`);

//     if (!result.recordset[0]) {
//       // User not found
//       return res.status(401).json({ message: "Invalid usercode" });
//     } else {
//       const user = result.recordset[0]; // Assuming the first record is the user data
//       // Check if the provided user_password matches the one in the database
//       if (user.user_password !== decryptedPassword) {
//         // Passwords don't match
//         return res.status(401).json({ message: "Invalid password" });
//       } else {
//         // Both username and password are validated successfully
//         if (result.recordset.length > 0) {
//           res.status(200).json(result.recordset); // 200 OK if data is found
//         } else {
//           res.status(404).json("Data not found"); // 404 Not Found if no data is found
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Error", err.message);
//     res.status(500).json({ message: err.message||'Internal Server Error'});
//   }       
// };

const login = async (req, res) => {
  const { user_code, user_password } = req.body;
  const secretKey = 'yjk26012024';

  try {
    const decryptedUserCode = CryptoJS.AES.decrypt(user_code, secretKey).toString(CryptoJS.enc.Utf8);
    const decryptedPassword = CryptoJS.AES.decrypt(user_password, secretKey).toString(CryptoJS.enc.Utf8);

    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "LUC")
      .input("user_code", sql.NVarChar, decryptedUserCode)
      .input("user_password", sql.NVarChar, decryptedPassword)
      .query(`EXEC SP_user_info_hdr 'LUC','',@user_code,'','','',@user_password,'','','','','','','','','','','','','','','','','',''`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err.message);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Signup handler
const signUp = async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if the user already exists in the database
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM yjk_users WHERE Ymail = @Email");

    if (result.recordset.length === 0) {
      // If user does not exist, generate and send OTP
      const otp = generateOTP();
      await sendOTP(email, otp);

      // Store OTP temporarily for verification
      otpStorage[email] = otp;

      // Proceed with adding user to the database
      await pool
        .request()
        .input("Name", sql.NVarChar, name)
        .input("Email", sql.NVarChar, email)
        .query("INSERT INTO yjk_users (Name, Ymail) VALUES (@Name, @Email)");

      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(401).json({ message: "Existing User" });
    }
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Verify OTP handler
const verifyOtp = (req, res) => {
  const { email_id, enteredOtp } = req.body;

  try {
    const storedOtp = otpStorage[email_id];
    if (storedOtp && storedOtp === enteredOtp) {
      // If OTP is valid, clear the OTP storage
      delete otpStorage[email_id];
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getvariant = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Item_variant','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const gettaxitempur = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC [sp_tax_name_hdr] 'TP',@company_code,'tax_type','',0,'','','','','','','','',null,null,null,null,null,null,null,null"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const gettaxitemsales = async (req, res) => {
  const { company_code } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.VarChar, company_code)
      .query(`EXEC [sp_tax_name_hdr] @mode,@company_code,'', '', 0, '', '','', '', '','', '','',
    null, null, null, null, null, null, null, null;`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const getuom = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'UOM','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getCity = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'city','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getCountry = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'country','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getState = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'state','',' ', ' ' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getStatus = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'status','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getShift = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Shift','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getTransaction = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Transaction Type','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getGender = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Gender','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getLoginorout = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Log IN/OUT','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getDeletepermission = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'deletepermission','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getregisterbrand = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Register_brand','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getboolean = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'boolean','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getourbrand = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'our_brand','','', '' , '','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const gethdrcode = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'TS','','', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const gettaxtype = async (req, res) => {
  const { company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_tax_name_hdr 'F',@company_code,'','',0,'','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getUsercode = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC SP_user_info_hdr 'F','','user_code','','', '' ,'','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );


    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getUsertype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'User Type', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const getscreentype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Sc type', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"

      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getCompanyno = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_company_info 'F','', ' ', '', '', '', '', '',  '', '' , '', '', '','',  '','','','','',null,NULL, NULL,NULL,NULL,NULL,NULL,NULL,NULL,null,null,null`
    );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getLocationno = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_location_info 'F','', '', '', '', '', '', '','', '', '', '', '',  0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getvendorcode = async (req, res) => {
  const { company_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "F")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_vendor_info_hdr @mode,@company_code,'','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPaytype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'paytype','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPurchasetype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'PutchaseType','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSalestype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'SalesType','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getordertype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'ORDER TYPE','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getroleid = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_role_info 'F',@company_code,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const gettypeperdata = async (req, res) => {
  const { tax_type_header, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.VarChar, company_code)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .query(`EXEC sp_tax_name_details @mode,@company_code,@tax_type_header,'',0,'','','','','','',
        NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getsearchdata = async (req, res) => {
  const { company_no, company_name, city, state, pincode, country, status, company_gst_no } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_no", sql.NVarChar, company_no)
      .input("company_name", sql.NVarChar, company_name)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("company_gst_no", sql.NVarChar, company_gst_no)
      .input("status", sql.NVarChar, status)
      .query(` EXEC sp_company_info @mode,@company_no,@company_name,'','','','',@city,@state,@pincode,@country,@company_gst_no,@status,'','','','','','',@company_gst_no,'','','','','','','','','','','' `);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addData = async (req, res) => {
  const {
    company_no, company_name, short_name, address1, address2, address3, city, state, pincode,
    country, email_id, status, foundedDate, websiteURL, contact_no, annualReportURL, location_no, company_gst_no, created_by, modified_by,
    tempstr1, tempstr2, tempstr3, tempstr4, datetime1, datetime2, datetime3, datetime4,
  } = req.body;

  let company_logo = req.files['company_logo'] ? req.files['company_logo'][0].buffer : null;
  let authorisedSignatur = req.files['authorisedSignatur'] ? req.files['authorisedSignatur'][0].buffer : null;

  try {
    pool = await sql.connect(dbConfig);

    // If the company code doesn't exist, proceed with inserting the data
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_no", sql.NVarChar, company_no)
      .input("company_name", sql.NVarChar, company_name)
      .input("short_name", sql.NVarChar, short_name)
      .input("address1", sql.NVarChar, address1)
      .input("address2", sql.NVarChar, address2)
      .input("address3", sql.NVarChar, address3)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("email_id", sql.NVarChar, email_id)
      .input("status", sql.NVarChar, status)
      .input("foundedDate", sql.NVarChar, foundedDate)
      .input("websiteURL", sql.NVarChar, websiteURL)
      .input("company_logo", sql.VarBinary, company_logo)
      .input("contact_no", sql.NVarChar, contact_no)
      .input("annualReportURL", sql.NVarChar, annualReportURL)
      .input("location_no", sql.NVarChar, location_no)
      .input("company_gst_no", sql.NVarChar, company_gst_no)
      .input("authorisedSignatur", sql.VarBinary, authorisedSignatur)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_company_info @mode, @company_no, @company_name, @short_name, @address1, @address2, @address3, @city, @state, @pincode, @country, @email_id, 
        @status, @foundedDate, @websiteURL, @company_logo, @contact_no, @annualReportURL,@location_no,@company_gst_no,@authorisedSignatur,@created_by,@modified_by,  
         @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
        @datetime1, @datetime2, @datetime3, @datetime4`
      );

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const saveEditedData = async (req, res) => {
  const editedData = req.body.editedData;
  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }
  try {
    const pool = await connection.connectToDatabase();
    for (const updatedRow of editedData) {
      const company_logo =
        updatedRow.company_logo && updatedRow.company_logo.type === "Buffer"
          ? Buffer.from(updatedRow.company_logo.data)
          : null;

      const authorisedSignatur =
        updatedRow.authorisedSignatur && updatedRow.authorisedSignatur.type === "Buffer"
          ? Buffer.from(updatedRow.authorisedSignatur.data)
          : null;

      console.log(company_logo);
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_no", updatedRow.company_no)
        .input("company_name", updatedRow.company_name)
        .input("short_name", updatedRow.short_name)
        .input("address1", updatedRow.address1)
        .input("address2", updatedRow.address2)
        .input("address3", updatedRow.address3)
        .input("city", updatedRow.city)
        .input("state", updatedRow.state)
        .input("pincode", updatedRow.pincode)
        .input("country", updatedRow.country)
        .input("email_id", updatedRow.email_id)
        .input("status", updatedRow.status)
        .input("foundedDate", updatedRow.foundedDate)
        .input("websiteURL", updatedRow.websiteURL)
        .input("company_logo", sql.VarBinary, company_logo)
        .input("contact_no", updatedRow.contact_no)
        .input("annualReportURL", updatedRow.annualReportURL)
        .input("location_no", updatedRow.location_no)
        .input("company_gst_no", updatedRow.company_gst_no)
        .input("authorisedSignatur", sql.VarBinary, authorisedSignatur)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_company_info @mode, @company_no, @company_name, @short_name, @address1, @address2, @address3, @city, @state, @pincode, @country, @email_id,
          @status, @foundedDate, @websiteURL,@company_logo,@contact_no,@annualReportURL,@location_no,@company_gst_no,@authorisedSignatur,@created_by,@modified_by,
           @tempstr1, @tempstr2, @tempstr3, @tempstr4,
          @datetime1, @datetime2, @datetime3, @datetime4`);
    }
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deleteData = async (req, res) => {
  const company_nosToDelete = req.body.company_nos;

  if (!company_nosToDelete || !company_nosToDelete.length) {
    res.status(400).json("Invalid or empty company_nos array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const company_no of company_nosToDelete) {

      await pool.request().input("company_no", company_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`
          EXEC sp_company_info 'D', @company_no,'','','','','','','','',
          '','','','','','','','',
          '','','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
        `);
    }

    res.status(200).json("Companies deleted successfully");
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getAlluserData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC SP_user_info_hdr 'A','','','','',' ','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const userAddData = async (req, res) => {
  const {
    company_code,
    user_code,
    user_name,
    first_name,
    last_name,
    user_password,
    user_status,
    log_in_out,
    user_type,
    email_id,
    dob,
    gender,
    role_id,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  let user_img = null;

  if (req.file) {
    user_img = req.file.buffer; // Buffer containing the uploaded image
  }
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("user_password", sql.NVarChar, user_password)
      .input("user_status", sql.NVarChar, user_status)
      .input("log_in_out", sql.NVarChar, log_in_out)
      .input("user_type", sql.NVarChar, user_type)
      .input("email_id", sql.NVarChar, email_id)
      .input("dob", sql.NVarChar, dob)
      .input("gender", sql.NVarChar, gender)
      .input("role_id", sql.NVarChar, role_id)
      .input("user_img", sql.VarBinary, user_img)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC SP_user_info_hdr @mode,@company_code,@user_code,@user_name,
        @first_name,@last_name,@user_password,
        @user_status,@log_in_out,@user_type,
        @email_id,@dob,@gender,@role_id,@user_img,@created_by,@modified_by,
        @tempstr1, @tempstr2, @tempstr3, @tempstr4,    
        @datetime1, @datetime2, @datetime3, @datetime4`
      );
    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'User already exists', err: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }

};


const UsersaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U") // update mode
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("user_code", sql.NVarChar, updatedRow.user_code)
        .input("user_name", sql.NVarChar, updatedRow.user_name)
        .input("first_name", sql.NVarChar, updatedRow.first_name)
        .input("last_name", sql.NVarChar, updatedRow.last_name)
        .input("user_password", sql.NVarChar, updatedRow.user_password)
        .input("user_status", sql.NVarChar, updatedRow.user_status)
        .input("log_in_out", sql.NVarChar, updatedRow.log_in_out)
        .input("user_type", sql.NVarChar, updatedRow.user_type)
        .input("email_id", sql.NVarChar, updatedRow.email_id)
        .input("dob", sql.NVarChar, updatedRow.dob)
        .input("gender", sql.NVarChar, updatedRow.gender)
        .input("role_id", sql.NVarChar, updatedRow.role_id)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC SP_user_info_hdr 
            'U',@company_code, @user_code, @user_name, @first_name, @last_name, 
            @user_password, @user_status, @log_in_out, @user_type, 
            @email_id, @dob, @gender,@role_id,'', @created_by,  
            @modified_by, @tempstr1, @tempstr2, @tempstr3, 
            @tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`
        );
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const UserdeleteData = async (req, res) => {
  const user_codesToDelete = req.body.user_codes;

  if (!user_codesToDelete || !user_codesToDelete.length) {
    res.status(400).json("Invalid or empty user_codes array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const user_code of user_codesToDelete) {
      try {
        await pool.request()
          .input("user_code", user_code)
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`
      EXEC SP_user_info_hdr 'D',@company_code,@user_code,'','','', 
            '', '', '', '','','', '','','','', 
            @modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(500).json("The user cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("user deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const getAllWareHouseData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query("select * from tbl_warehouse_info");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getwarehouseSearchdata = async (req, res) => {
  const { company_code, warehouse_code, warehouse_name, status, location_no } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("warehouse_name", sql.NVarChar, warehouse_name)
      .input("status", sql.NVarChar, status)
      .input("location_no", sql.NVarChar, location_no)
      .query(` EXEC sp_warehouse_info @mode,@company_code,@warehouse_code,@warehouse_name,@status,@location_no,'','','','',NULL,NULL,NULL,NULL,'',''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const AddWareHouseData = async (req, res) => {
  const {
    company_code,
    warehouse_code,
    warehouse_name,
    status,
    location_no,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("warehouse_name", sql.NVarChar, warehouse_name)
      .input("status", sql.NVarChar, status)
      .input("location_no", sql.NVarChar, location_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_warehouse_info @mode,@company_code,@warehouse_code,
        @warehouse_name,@status,@location_no,@created_by,
        @modified_by,
        @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
        @datetime1, @datetime2, @datetime3, @datetime4`
      );

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Warehouse already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};



// update for WareHouse Data
const WareHousesaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U") // update mode
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("warehouse_code", sql.NVarChar, updatedRow.warehouse_code)
        .input("warehouse_name", sql.NVarChar, updatedRow.warehouse_name)
        .input("status", sql.NVarChar, updatedRow.status)
        .input("location_no", sql.NVarChar, updatedRow.location_no)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_warehouse_info 
            'U',@company_code, @warehouse_code, @warehouse_name, @status, @location_no, 
             @created_by,  @modified_by, 
             @tempstr1, @tempstr2, @tempstr3, @tempstr4,
              @datetime1, @datetime2, @datetime3, @datetime4`
        );
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const WareHousedeleteData = async (req, res) => {
  const warehouse_codesToDelete = req.body.warehouse_codes;

  if (!warehouse_codesToDelete || !warehouse_codesToDelete.length) {
    res.status(400).json("Invalid or empty warehouse_codes array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const warehouse_code of warehouse_codesToDelete) {
      try {
        await pool.request().
          input("warehouse_code", warehouse_code)
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`
        EXEC sp_warehouse_info 'D',@company_code,@warehouse_code,'','','','',@modified_by,'','','','','','','',''
        `);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The warehouse cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("WareHouse deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getAllRoleInfoData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_role_Info 'A','','','','','','','','','','','','','',''`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const AddRoleInfoData = async (req, res) => {
  const {
    company_code,
    role_id,
    role_name,
    description,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .input("description", sql.NVarChar, description)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_role_info @mode,@company_code, @role_id,
        @role_name,@description,
        @created_by,@modified_by,
        @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
        @datetime1, @datetime2, @datetime3, @datetime4`
      );

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Role already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};


// update for WareHouse Data
const RolesaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U") // update mode
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("role_id", sql.NVarChar, updatedRow.role_id)
        .input("role_name", sql.NVarChar, updatedRow.role_name)
        .input("description", sql.NVarChar, updatedRow.description)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_Role_Info @mode,@company_code,@role_id,@role_name,@description,@created_by,@modified_by,@tempstr1,@tempstr2,
          @tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4
          `
        );
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




//ATRRIBUTE HDR SCREEN DATACONTROLLER

//GET ATTRIBUTES HEADER DATA
const getAllattributehdrData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query("select * from tbl_attribute_info_hdr");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//ADD DATAS IN ATTRIBUTE HEADER TABLE
const addattrihdrData = async (req, res) => {
  const {
    company_code,
    attributeheader_code,
    attributeheader_name,
    status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("attributeheader_name", sql.NVarChar, attributeheader_name)
      .input("status", sql.NVarChar, status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_attribute_hdr @mode,@company_code,@attributeheader_code,@attributeheader_name,@status,@created_by,@modified_by,@tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};

const getAllattributedetData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_attribute_info 'A','','', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//ADD DATAS IN ATTRIBUTE DETAILS TABLE
const addattridetData = async (req, res) => {
  const {
    company_code,
    attributeheader_code,
    attributedetails_code,
    attributedetails_name,
    descriptions,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  try {
    // Input validation
    if (!attributeheader_code) {
      return res.status(400).json({ error: 'Attribute Header Code cannot be blank' });
    }

    // Establish connection to the database
    const pool = await sql.connect(dbConfig);

    // Execute the stored procedure
    const result = await pool.request()
      .input('mode', sql.NVarChar, 'I') // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input('attributeheader_code', sql.NVarChar, attributeheader_code)
      .input('attributedetails_code', sql.NVarChar, attributedetails_code)
      .input('attributedetails_name', sql.NVarChar, attributedetails_name)
      .input('descriptions', sql.NVarChar, descriptions)
      .input('created_by', sql.NVarChar, created_by)
      .input('modified_by', sql.NVarChar, modified_by)
      .input('tempstr1', sql.NVarChar, tempstr1)
      .input('tempstr2', sql.NVarChar, tempstr2)
      .input('tempstr3', sql.NVarChar, tempstr3)
      .input('tempstr4', sql.NVarChar, tempstr4)
      .input('datetime1', sql.NVarChar, datetime1)
      .input('datetime2', sql.NVarChar, datetime2)
      .input('datetime3', sql.NVarChar, datetime3)
      .input('datetime4', sql.NVarChar, datetime4)
      .query(
        `EXEC sp_attribute_Info @mode,@company_code,@attributeheader_code, @attributedetails_code,@attributedetails_name,@descriptions,@created_by,@modified_by,@tempstr1, @tempstr2, @tempstr3, @tempstr4, 
        @datetime1, @datetime2, @datetime3, @datetime4`
      );
    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};


const deleteAttriDetailData = async (req, res) => {
  const { attributeheader_codesToDelete, attributedetails_codeToDelete } = req.body;

  if (!attributeheader_codesToDelete || !attributeheader_codesToDelete.length || !attributedetails_codeToDelete || !attributedetails_codeToDelete.length) {
    res.status(400).json("Invalid or empty Codes or codeDetails array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    const deleteQuery = `EXEC sp_attribute_Info 'D',@company_code,@attributeheader_code, @attributedetails_code,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
    `;
    for (let i = 0; i < attributeheader_codesToDelete.length; i++) {
      try {
        await pool.request()
          .input("attributeheader_code", attributeheader_codesToDelete[i])
          .input("attributedetails_code", attributedetails_codeToDelete[i])
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .query(deleteQuery);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The attribute cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("Attribute data deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const updattridetData = async (req, res) => {
  const { attributeheader_codesToUpdate, attributedetails_codesToUpdate, updatedData } = req.body;

  if (!attributeheader_codesToUpdate || !attributeheader_codesToUpdate.length ||
    !attributedetails_codesToUpdate || !attributedetails_codesToUpdate.length ||
    !updatedData || !updatedData.length) {
    res.status(400).json("Invalid or empty input data.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (let i = 0; i < attributeheader_codesToUpdate.length; i++) {
      const updatedRow = updatedData[i]; // Assuming updatedData is an array of objects with updated values

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("attributeheader_code", attributeheader_codesToUpdate[i])
        .input("attributedetails_code", attributedetails_codesToUpdate[i])
        .input("attributedetails_name", sql.NVarChar, updatedRow.attributedetails_name)
        .input("descriptions", sql.NVarChar, updatedRow.descriptions)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_attribute_Info @mode,@company_code, @attributeheader_code, @attributedetails_code, @attributedetails_name, @descriptions, @created_by,@modified_by, @tempstr1, @tempstr2, @tempstr3, @tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`
        );
    }

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getAllTaxHdrData = async (req, res) => {
  const { company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_tax_name_hdr 'A',@company_code,'','',0,'','','','','','','','',null,null,null,null,null,null,null,null `
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//Dhana created on 22-apr-2024   use:taxinformation
const addTaxHdrData = async (req, res) => {
  const {
    company_code,
    tax_type,
    tax_name,
    tax_percentage,
    tax_shortname,
    tax_accountcode,
    transaction_type,
    status,
    tax_type_Sales,
    Keyfield,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.VarChar, company_code)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name", sql.NVarChar, tax_name)
      .input("tax_percentage", sql.Decimal(14, 2), tax_percentage)
      .input("tax_shortname", sql.NVarChar, tax_shortname)
      .input("tax_accountcode", sql.NVarChar, tax_accountcode)
      .input("transaction_type", sql.NVarChar, transaction_type)
      .input("status", sql.NVarChar, status)
      .input("tax_type_Sales", sql.NVarChar, tax_type_Sales)
      .input("Keyfield", sql.NVarChar, Keyfield)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC [sp_tax_name_hdr] @mode,@company_code,@tax_type,@tax_name,@tax_percentage,@tax_shortname,@tax_accountcode,@transaction_type,@status,@tax_type_Sales,@Keyfield,@created_by,@modified_by,
        @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json(err.message);
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//dhana-taxnamedetails//

const getAllTaxDetailsData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_tax_name_details 'A','','',0,'','','','','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addTaxDetailsData = async (req, res) => {
  const {
    company_code,
    tax_type_header,
    tax_name_details,
    tax_percentage,
    tax_shortname,
    tax_accountcode,
    transaction_type,
    status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.VarChar, company_code)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.Decimal(14, 2), tax_percentage)
      .input("tax_shortname", sql.NVarChar, tax_shortname)
      .input("tax_accountcode", sql.NVarChar, tax_accountcode)
      .input("transaction_type", sql.NVarChar, transaction_type)
      .input("status", sql.NVarChar, status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_tax_name_details @mode,@company_code,@tax_type_header, @tax_name_details, @tax_percentage,@tax_shortname,@tax_accountcode,@transaction_type,@status,@created_by,@modified_by,
        @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);

      res.status(200).json("Data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const updtaxdetaildata = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.VarChar, req.headers['company_code'])
        .input("tax_type_header", updatedRow.tax_type_header)
        .input("tax_name_details", updatedRow.tax_name_details)
        .input("tax_percentage", updatedRow.tax_percentage)
        .input("tax_shortname", updatedRow.tax_shortname)
        .input("tax_accountcode", updatedRow.tax_accountcode)
        .input("transaction_type", updatedRow.transaction_type)
        .input("status", updatedRow.status)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_tax_name_details @mode,@company_code,@tax_type_header, @tax_name_details, @tax_percentage, @tax_shortname, @tax_accountcode, @transaction_type, @status, @created_by, @modified_by,
             @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
            @datetime1, @datetime2, @datetime3, @datetime4`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// ITEM BRAND INFO
const getAllItemBrandData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_item_brand_info 'A','','','','',0,'','','',0,0,0,0,'','','','','','','','','',
      '','',0,0,'','0','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



//ADD DATAS Item  DETAILS  TABLE
const addItemBrandData = async (req, res) => {
  const {
    company_code,
    Item_code,
    Item_variant,
    Item_name,
    Item_wigh,
    Item_BaseUOM,
    Item_SecondaryUOM,
    Item_short_name,
    Item_Last_salesRate_ExTax,
    Item_Last_salesRate_IncludingTax,
    Item_std_purch_price,
    Item_std_sales_price,
    Item_purch_tax_type,
    Item_sales_tax_type,
    Item_Costing_Method,
    hsn,
    Item_Register_Brand,
    Item_Our_Brand,
    status,
    barcodeimg,
    Item_other_purch_taxtype,
    Item_other_sales_taxtype,
    MRP_price,
    discount_Percentage,
    Item_Description,
    Is_Default,
    Display_Order,
    created_by,
    modified_by
  } = req.body;

  let item_images = null;

  if (req.file) {
    item_images = req.file.buffer; // Buffer containing the uploaded image
  }

  try {
    pool = await sql.connect(dbConfig);

    // const bufferImage = Buffer.from(item_images, 'base64')

    await pool
      .request()
      .input("mode",                              sql.NVarChar, "I") 
      .input("company_code",                      sql.NVarChar, company_code)
      .input("Item_code",                         sql.NVarChar, Item_code)
      .input("Item_variant",                      sql.NVarChar, Item_variant)
      .input("Item_name",                         sql.NVarChar, Item_name)
      .input("Item_wigh",                         sql.Decimal(10, 2), Item_wigh)
      .input("Item_BaseUOM",                      sql.NVarChar, Item_BaseUOM)
      .input("Item_SecondaryUOM",                 sql.NVarChar, Item_SecondaryUOM)
      .input("Item_short_name",                   sql.NVarChar, Item_short_name)
      .input("Item_Last_salesRate_ExTax",         sql.Decimal(12, 2), Item_Last_salesRate_ExTax)
      .input("Item_Last_salesRate_IncludingTax",  sql.Decimal(12, 2), Item_Last_salesRate_IncludingTax)
      .input("Item_std_purch_price",              sql.Decimal(12, 2), Item_std_purch_price)
      .input("Item_std_sales_price",              sql.Decimal(12, 2), Item_std_sales_price)
      .input("Item_purch_tax_type",               sql.NVarChar, Item_purch_tax_type)
      .input("Item_sales_tax_type",               sql.NVarChar, Item_sales_tax_type)
      .input("Item_Costing_Method",               sql.NVarChar, Item_Costing_Method)
      .input("hsn",                               sql.NVarChar, hsn)
      .input("Item_Register_Brand",               sql.NVarChar, Item_Register_Brand)
      .input("Item_Our_Brand",                    sql.NVarChar, Item_Our_Brand)
      .input("status",                            sql.NVarChar, status)
      .input("item_images",                       sql.VarBinary, item_images)
      .input("barcodeimg",                        sql.NVarChar, barcodeimg)
      .input("Item_other_purch_taxtype",          sql.NVarChar, Item_other_purch_taxtype)
      .input("Item_other_sales_taxtype",          sql.NVarChar, Item_other_sales_taxtype)
      .input("MRP_price",                         sql.Decimal(10,2), MRP_price)
      .input("discount_Percentage",               sql.Decimal(5,2), discount_Percentage)
      .input("Item_Description",                sql.NVarChar, Item_Description	)
      .input("Is_Default",                      sql.Bit, Is_Default	)
      .input("Display_Order",                      sql.Int, Display_Order)
      .input("created_by",                        sql.NVarChar, created_by)
      .input("modified_by",                       sql.NVarChar, modified_by)
      .query(`EXEC sp_item_brand_info_TEST @mode,@company_code,@Item_code,@Item_variant,@Item_name,@Item_wigh,@Item_BaseUOM,@Item_SecondaryUOM,@Item_short_name,@Item_Last_salesRate_ExTax,@Item_Last_salesRate_IncludingTax,
        @Item_std_purch_price,@Item_std_sales_price,@Item_purch_tax_type,@Item_sales_tax_type,@Item_Costing_Method,@hsn,@Item_Register_Brand,@Item_Our_Brand,@status,@item_images,@barcodeimg,@Item_other_purch_taxtype,
        @Item_other_sales_taxtype,@MRP_price,@discount_Percentage,'',@Item_Description,@Is_Default,@Display_Order,@created_by,@modified_by,NULL,NULL,NULL,NULL
						   ,NULL,NULL,NULL,NULL`);
     return res.status(200).json({ success: true, message: 'Data inserted successfully' });
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};





const deleteItemData = async (req, res) => {
  const Item_codesToDelete = req.body.Item_codes;

  if (!Item_codesToDelete || !Item_codesToDelete.length) {
    res.status(400).json("Invalid or empty Codes or codeDetails array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    const companyCode = req.headers['company_code'];
    const modifiedBy = req.headers['modified-by'];

    console.log("Company Code:", companyCode); // 👈 log company code here
    console.log("Modified By:", modifiedBy);   // 👈 optional: log modified-by

    for (const updatedRow of Item_codesToDelete) {
      await pool.request()
        .input("Item_code", updatedRow.Item_code)
        .input("company_code", sql.NVarChar, companyCode)
        .input("modified_by", sql.NVarChar, modifiedBy)
        .query(`EXEC sp_item_brand_info 'D',@company_code,@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','',
          '','','',0,0,'','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    }

    res.status(200).json("Item deleted successfully");
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//VENDOR HRD INFO //

const addVendorHdrData = async (req, res) => {
  const {
    company_code,
    vendor_code,
    vendor_name,
    status,
    vendor_logo,
    panno,
    vendor_gst_no,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("status", sql.NVarChar, status)
      .input("vendor_logo", sql.NVarChar, vendor_logo)
      .input("panno", sql.NVarChar, panno)
      .input("vendor_gst_no", sql.NVarChar, vendor_gst_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_vendor_info_hdr @mode,@company_code,@vendor_code, @vendor_name, @status,'',@panno,@vendor_gst_no,@created_by,@modified_by,
        @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};


const getAllVendorHdrData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_vendor_info_hdr 'A','','','','','','','','','',null,null,null,null,null,null,null,null`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


// VENDOR DET INFO//
const getAllVendorDetData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await 
    sql.query(`EXEC sp_vendor_details_info_hdr 'A','','','','','','','','','','','','','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const addVendorDetData = async (req, res) => {
  const {
    vendor_code,
    company_code,
    vendor_name,
    status,
    panno,
    vendor_gst_no,
    vendor_addr_1,
    vendor_addr_2,
    vendor_addr_3,
    vendor_addr_4,
    vendor_area_code,
    vendor_state_code,
    vendor_country_code,
    vendor_office_no,
    vendor_resi_no,
    vendor_mobile_no,
    vendor_email_id,
    vendor_salesman_code,
    contact_person,
    office_type,
    created_by,
    modified_by
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("vendor_code", sql.VarChar, vendor_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("status", sql.NVarChar, status)
      .input("panno", sql.NVarChar, panno)
      .input("vendor_gst_no", sql.NVarChar, vendor_gst_no)
      .input("vendor_addr_1", sql.VarChar, vendor_addr_1)
      .input("vendor_addr_2", sql.VarChar, vendor_addr_2)
      .input("vendor_addr_3", sql.VarChar, vendor_addr_3)
      .input("vendor_addr_4", sql.VarChar, vendor_addr_4)
      .input("vendor_area_code", sql.VarChar, vendor_area_code)
      .input("vendor_state_code", sql.VarChar, vendor_state_code)
      .input("vendor_country_code", sql.VarChar, vendor_country_code)
      .input("vendor_office_no", sql.NVarChar, vendor_office_no)
      .input("vendor_resi_no", sql.NVarChar, vendor_resi_no)
      .input("vendor_mobile_no", sql.NVarChar, vendor_mobile_no)
      .input("vendor_email_id", sql.NVarChar, vendor_email_id)
      .input("vendor_salesman_code", sql.NVarChar, vendor_salesman_code)
      .input("contact_person", sql.NVarChar, contact_person)
      .input("office_type", sql.NVarChar, office_type)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,@vendor_name,@status,@panno,@vendor_gst_no,@vendor_addr_1,@vendor_addr_2,@vendor_addr_3,
        @vendor_addr_4,@vendor_area_code,@vendor_state_code,@vendor_country_code,@vendor_office_no,@vendor_resi_no,@vendor_mobile_no,@vendor_email_id,
        @vendor_salesman_code,@contact_person,@office_type,'',@created_by,@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const updvendordetData = async (req, res) => {
  const { vendor_codesToUpdate, company_codesToUpdate, updatedData } = req.body;

  if (!vendor_codesToUpdate || !vendor_codesToUpdate.length ||
    !company_codesToUpdate || !company_codesToUpdate.length ||
    !updatedData || !updatedData.length) {
      return res.status(400).json("Invalid or empty input data.");
    }

  try {
    const pool = await connection.connectToDatabase();

    for (let i = 0; i < vendor_codesToUpdate.length; i++) {
      const updatedRow = updatedData[i]; // Assuming updatedData is an array of objects with updated values

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("vendor_code", vendor_codesToUpdate[i])
        .input("company_code", company_codesToUpdate[i])
        .input("vendor_name", sql.NVarChar, updatedRow.vendor_name)
        .input("status", sql.NVarChar, updatedRow.status)
        .input("panno", sql.NVarChar, updatedRow.panno)
        .input("vendor_gst_no", sql.NVarChar, updatedRow.vendor_gst_no)
        .input("vendor_addr_1", sql.NVarChar, updatedRow.vendor_addr_1)
        .input("vendor_addr_2", sql.NVarChar, updatedRow.vendor_addr_2)
        .input("vendor_addr_3", sql.NVarChar, updatedRow.vendor_addr_3)
        .input("vendor_addr_4", sql.NVarChar, updatedRow.vendor_addr_4)
        .input("vendor_area_code", sql.NVarChar, updatedRow.vendor_area_code)
        .input("vendor_state_code", sql.NVarChar, updatedRow.vendor_state_code)
        .input("vendor_country_code", sql.NVarChar, updatedRow.vendor_country_code)
        .input("vendor_office_no", sql.NVarChar, updatedRow.vendor_office_no)
        .input("vendor_resi_no", sql.NVarChar, updatedRow.vendor_resi_no)
        .input("vendor_mobile_no", sql.NVarChar, updatedRow.vendor_mobile_no)
        .input("vendor_email_id", sql.NVarChar, updatedRow.vendor_email_id)
        .input("vendor_salesman_code", sql.NVarChar, updatedRow.vendor_salesman_code)
        .input("contact_person", sql.NVarChar, updatedRow.contact_person)
        .input("office_type", sql.NVarChar, updatedRow.office_type)
        .input("keyfield", sql.NVarChar, updatedRow.keyfield)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,@vendor_name,@status,@panno,@vendor_gst_no,@vendor_addr_1,@vendor_addr_2,@vendor_addr_3,
        @vendor_addr_4,@vendor_area_code,@vendor_state_code,@vendor_country_code,@vendor_office_no,@vendor_resi_no,@vendor_mobile_no,@vendor_email_id,
        @vendor_salesman_code,@contact_person,@office_type,@keyfield,@created_by,@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    }

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const VendordeleteData = async (req, res) => {
  const { keyfieldsToDelete } = req.body;

  if (!keyfieldsToDelete || !keyfieldsToDelete.length) {
    res.status(400).json("Invalid or empty Codes or codeDetails array.");
    return;
  }
  try {
    const pool = await connection.connectToDatabase();

    const deleteQuery = `EXEC sp_vendor_details_info_hdr 'D','',@company_code,'','','','','','','','','','','','','','','',
    '','','',@keyfield,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`;
    for (let i = 0; i < keyfieldsToDelete.length; i++) {
      await pool.request()
        .input("keyfield", keyfieldsToDelete[i])
        .input("company_code", sql.NVarChar, req.headers['company-code'])
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(deleteQuery);
    }

    res.status(200).json("Vendor data deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//Dhana create on : 02may2024 COMPANY MAPPING//
const getAllCompanyMappingData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_user_company_mapping 'I','','','','','',0,'','','',
      NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
const addCompanyMappingData = async (req, res) => {
  const {
    company_code,
    user_code,
    company_no,
    location_no,
    status,
    order_no,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.VarChar, user_code)
      .input("company_no", sql.NVarChar, company_no)
      .input("location_no", sql.VarChar, location_no)
      .input("status", sql.VarChar, status)
      .input("order_no", sql.Int, order_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_user_company_mapping @mode,@company_code,@user_code,@company_no,@location_no,@status,@order_no,'',@created_by,@modified_by,
        @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }
};


const getitemcodepurdata = async (req, res) => {
  const { Item_code, company_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode",            sql.NVarChar, "STPIC")
      .input("Item_code",       sql.NVarChar, Item_code)
      .input("company_code",    sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,'','',0,'','','',0,0,0,0,'','','','','','',
        '','','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getAllUserRoleMappingData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_user_rolemapping 'A','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
const addUserRoleMappingData = async (req, res) => {
  const {
    company_code,
    user_code,
    role_id,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.VarChar, user_code)
      .input("role_id", sql.NVarChar, role_id)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_user_rolemapping @mode,@company_code, @user_code,'',@role_id,'','',@created_by,@modified_by,
        @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);

    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'User & Role already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }
};

const getlocationsearchdata = async (req, res) => {
  const { company_code, location_no, location_name, city, state, pincode, country, status } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("location_no", sql.NVarChar, location_no)
      .input("location_name", sql.NVarChar, location_name)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("status", sql.NVarChar, status)
      .query(` EXEC sp_location_info @mode,@location_no,@location_name, '', '', '', '', @city,@state, @pincode, @country, '', 
        @status, '', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addlocationinfo = async (req, res) => {
  const { location_no, location_name, short_name, address1, address2, address3, city, state, pincode,
    country, email_id, status, contact_no, created_by, modified_by,
    tempstr1, tempstr2, tempstr3, tempstr4, datetime1, datetime2, datetime3, datetime4,
  } = req.body;

  let pool;
  try {
    pool = await sql.connect(dbConfig);



    // If the company code doesn't exist, proceed with inserting the data
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("location_no", sql.NVarChar, location_no)
      .input("location_name", sql.NVarChar, location_name)
      .input("short_name", sql.NVarChar, short_name)
      .input("address1", sql.NVarChar, address1)
      .input("address2", sql.NVarChar, address2)
      .input("address3", sql.NVarChar, address3)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("email_id", sql.NVarChar, email_id)
      .input("status", sql.NVarChar, status)
      .input("contact_no", sql.NVarChar, contact_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_location_info @mode,@location_no, @location_name, @short_name, @address1, @address2, @address3, @city, @state, @pincode, @country, @email_id, 
      @status,  @contact_no, @created_by,@modified_by,
       @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
      @datetime1, @datetime2, @datetime3, @datetime4`
      );

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Location already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }
};

const locationsaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("location_no", updatedRow.location_no)
        .input("location_name", updatedRow.location_name)
        .input("short_name", updatedRow.short_name)
        .input("address1", updatedRow.address1)
        .input("address2", updatedRow.address2)
        .input("address3", updatedRow.address3)
        .input("city", updatedRow.city)
        .input("state", updatedRow.state)
        .input("pincode", updatedRow.pincode)
        .input("country", updatedRow.country)
        .input("email_id", updatedRow.email_id)
        .input("status", updatedRow.status)
        .input("contact_no", updatedRow.contact_no)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_location_info @mode,@location_no, @location_name, @short_name, @address1, @address2, 
          @address3, @city, @state, @pincode, @country, @email_id,  @status, @contact_no, @created_by, @modified_by , 
         @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
        @datetime1, @datetime2, @datetime3, @datetime4`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const locationdeleteData = async (req, res) => {
  const location_nosToDelete = req.body.location_nos;

  if (!location_nosToDelete || !location_nosToDelete.length) {
    res.status(400).json("Invalid or empty location no's array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const location_no of location_nosToDelete) {
      try {
        await pool.request().input("location_no", location_no)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`EXEC sp_location_info 'D',@location_no, '', '', '', '', '', 
          '', '', '', '', '','',  '', '',@modified_by,
       NULL, NULL, NULL, NULL,NULL, NULL, NULL, NULL`
          );
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The location cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("Companies deleted successfully");
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getitemsearchdata = async (req, res) => {
  const { company_code, Item_code, Item_name, Item_variant, Item_short_name, Item_Our_Brand, status } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .input("Item_name", sql.NVarChar, Item_name)
      .input("Item_short_name", sql.NVarChar, Item_short_name)
      .input("Item_Our_Brand", sql.NVarChar, Item_Our_Brand)
      .input("status", sql.NVarChar, status)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,@Item_variant,@Item_name,0,'','',@Item_short_name,0,0,0,0,'','','','','',@Item_Our_Brand,@status,
        '','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getitempursearchdata = async (req, res) => {
  const { company_code, Item_code, Item_name, Item_variant, Item_short_name, Item_Our_Brand, status } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STP")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .input("Item_name", sql.NVarChar, Item_name)
      .input("Item_short_name", sql.NVarChar, Item_short_name)
      .input("Item_Our_Brand", sql.NVarChar, Item_Our_Brand)
      .input("status", sql.NVarChar, status)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,@Item_variant,@Item_name,0,'','',@Item_short_name,0,0,0,0,'','','','','',@Item_Our_Brand,@status,
        '','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getpursearchdata = async (req, res) => {
  const { company_code, transaction_no, transaction_date, vendor_code, vendor_name, purchase_type, pay_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("pay_type", sql.NVarChar, pay_type)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,'', @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
          0,0,0,0,0,0,0,0,'','','','','','','', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getpurDeleteDetails = async (req, res) => {
  const { company_code, transaction_no, transaction_date, vendor_code, vendor_name, purchase_type, pay_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SCD")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("pay_type", sql.NVarChar, pay_type)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,'', @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
          0,0,0,0,0,0,0,0,'','','','','','','', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




const getpurchasereturnit = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata 'PD',@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const getpurchasereturntax = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PT")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addpurchasereturntaxdetails = async (req, res) => {
  const {
    company_code, transaction_date, transaction_no, return_date, return_reason, return_person, return_no,
    vendor_code, ItemSNo, TaxSNo, item_code, item_name, tax_type, tax_name_details, tax_amt, tax_per, 
    pay_type, created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("return_no", sql.NVarChar, return_no)
      .input("return_date", sql.Date, return_date)
      .input("return_reason", sql.NVarChar, return_reason)
      .input("return_person", sql.NVarChar, return_person)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("tax_per", sql.Decimal(14, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_purchase_return_tax_details @mode,@company_code,@transaction_date,@return_no,@return_date,@return_reason,@return_person,@transaction_no,@vendor_code,@pay_type,@ItemSNo,@TaxSNo,@item_code,@item_name,@tax_type,@tax_name_details,@tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




const getpurchasereturndetails = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_return_details
            @mode,@company_code,'','','','','','','','','',0,0,0,0,0,0,0,'','','','','','',0,'',0,0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getpurchasereturntaxdetails = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_return_tax_details @mode,@company_code,'','','','','','','','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const addpurchasereturndetails = async (req, res) => {
  const {
    company_code, transaction_date, transaction_no, return_date, return_no, warehouse_code,
    vendor_code, item_code, item_name, return_item_name, bill_qty, return_qty, bill_rate,
    item_amt, weight, return_weight, total_weight, return_details, pay_type, purchase_type, sman_code,vendor_name, order_type, tax_amount, hsn, return_amt, ItemSNo, created_by,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("return_date", sql.Date, return_date)
      .input("return_no", sql.NVarChar, return_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("return_item_name", sql.NVarChar, return_item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("return_qty", sql.Decimal(10, 2), return_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("return_weight", sql.Decimal(8, 3), return_weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("return_details", sql.NVarChar, return_details)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("hsn", sql.NVarChar, hsn)
      .input("return_amt", sql.Decimal(10, 2), return_amt)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_return_details
            @mode,@company_code,@transaction_date,@transaction_no,@return_date,@return_no,@warehouse_code,@vendor_code,@item_code,@item_name,@return_item_name,@bill_qty,@return_qty,@bill_rate,@item_amt,@weight,@return_weight,@total_weight,@return_details,@pay_type,@purchase_type,@sman_code,@vendor_name,@order_type, @tax_amount,@hsn,@return_amt,@ItemSNo,'','',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.rowsAffected && result.rowsAffected.length > 0) {
      res.json({ success: true, message: "Data inserted successfully" });
    } else {
      res.json({ success: false, message: "Data not inserted" });
    }
  } catch (err) {
    // Log the error to console for debugging purposes
    console.error(err);
    // Send detailed error response to client
    res.status(500).json({ success: false, error: err.message });
  }
};



const getPurchaseData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "P")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Check if data is found
    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], // Provide an empty array if no data
        table3: result.recordsets[2] || []  // Provide an empty array if no data
      };
      res.status(200).json(data); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getsalessearchdata = async (req, res) => {
  const { company_code, bill_date, bill_no, warehouse_code, sales_type, customer_code, customer_name, sale_amt, bill_amt, pay_type, order_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.NVarChar, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("sale_amt", sql.Decimal(14, 2), sale_amt)
      .input("bill_amt", sql.Decimal(14, 2), bill_amt)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("order_type", sql.NVarChar, order_type)
      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_sales_hdr_test @mode,@company_code,@bill_date,@bill_no,@warehouse_code,@sales_type,@customer_code,@sale_amt,0,0,0,@bill_amt,0,0,@pay_type,'','',@customer_name,
        @order_type,'','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const getUserrolesearchdata = async (req, res) => {
  const { company_code, user_code, user_name, role_id, role_name } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .query(`EXEC sp_user_rolemapping @mode,@company_code,@user_code,@user_name,@role_id,@role_name,'','','',
      null,null,null,null,null,null,null,null `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getUsersearchdata = async (req, res) => {
  const { company_code, user_code, user_name, first_name, last_name, user_status, email_id, dob, gender, role_id, user_img } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("user_status", sql.NVarChar, user_status)
      .input("email_id", sql.NVarChar, email_id)
      .input("dob", sql.NVarChar, dob)
      .input("gender", sql.NVarChar, gender)
      .input("role_id", sql.NVarChar, role_id)
      .input("user_img", sql.NVarChar, user_img)
      .query(` EXEC SP_user_info_hdr @mode,@company_code,@user_code,@user_name,@first_name,@last_name,'',@user_status,'','',@email_id,@dob,@gender,@role_id,@user_img,'','','','','','','','','',''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getRolesearchdata = async (req, res) => {
  const { company_code, role_id, role_name } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .query(`EXEC sp_Role_Info @mode,@company_code,@role_id,@role_name,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const roledeleteData = async (req, res) => {
  const role_idsToDelete = req.body.role_ids;

  if (!role_idsToDelete || !role_idsToDelete.length) {
    res.status(400).json("Invalid or empty RoleID array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const role_id of role_idsToDelete) {
      try {
        await pool.request().input("role_id", role_id)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .query(`
          EXEC sp_Role_Info 'D',@company_code,@role_id,'','','',@modified_by,
        NULL, NULL, NULL, NULL,NULL, NULL, NULL, NULL
          `);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The role cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("User deleted successfully");
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getvendorSearchdata = async (req, res) => {
  const { company_code, vendor_code, vendor_name, panno, vendor_gst_no, vendor_addr_1, vendor_area_code, vendor_state_code, vendor_country_code, vendor_mobile_no, status } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("status", sql.NVarChar, status)
      .input("panno", sql.NVarChar, panno)
      .input("vendor_gst_no", sql.NVarChar, vendor_gst_no)
      .input("vendor_addr_1", sql.NVarChar, vendor_addr_1)
      .input("vendor_area_code", sql.NVarChar, vendor_area_code)
      .input("vendor_state_code", sql.NVarChar, vendor_state_code)
      .input("vendor_country_code", sql.NVarChar, vendor_country_code)
      .input("vendor_mobile_no", sql.NVarChar, vendor_mobile_no)
      .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,@vendor_name,@status,@panno,@vendor_gst_no,@vendor_addr_1,
        '','','',@vendor_area_code,@vendor_state_code,@vendor_country_code,'','',@vendor_mobile_no,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getAllpurhdrData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,'','','','','','','',
          0,0,0,0,0,0,0,0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




const addpurchaseheader = async (req, res) => {
  const { company_code, Entry_date, transaction_no, transaction_date, purchase_type, purchase_amount,total_amount, vendor_code, vendor_name, pay_type, add_fright, less_fright, tax_amount, rounded_off,cartage_paid, other_charges, status, deletePermission, created_by,
purchase_order_no
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code",      sql.NVarChar, company_code)
      .input("Entry_date",        sql.Date, Entry_date)
      .input("transaction_no",    sql.NVarChar, transaction_no)
      .input("transaction_date",  sql.Date, transaction_date)
      .input("purchase_type",     sql.NVarChar, purchase_type)
      .input("vendor_code",       sql.NVarChar, vendor_code)
      .input("vendor_name",       sql.NVarChar, vendor_name)
      .input("pay_type",          sql.NVarChar, pay_type)
      .input("purchase_amount",     sql.Decimal(14, 2), purchase_amount)
      .input("total_amount",      sql.Decimal(10, 2), total_amount)
      .input("add_fright",      sql.Decimal(14, 2), add_fright)
      .input("less_fright",     sql.Decimal(14, 2), less_fright)
      .input("tax_amount",      sql.Decimal(14, 2), tax_amount)
      .input("rounded_off",       sql.Decimal(14, 2), rounded_off)
      .input("cartage_paid",        sql.Decimal(14, 2), cartage_paid)
      .input("other_charges",     sql.Decimal(14, 2), other_charges)
      .input("status",            sql.NVarChar, status)
      .input("deletePermission",    sql.NVarChar, deletePermission)
      .input("purchase_order_no",        sql.NVarChar, purchase_order_no)
      .input("created_by",        sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,@Entry_date, @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
          @purchase_amount,@total_amount,@add_fright,@less_fright,@tax_amount,@rounded_off, @cartage_paid,@other_charges,@status,@deletePermission,
          '','',@purchase_order_no,@created_by,'', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json(err.message);
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getAllpurhdetData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_details 'A',@company_code,'','','','',0,'','',0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const addpurchasedetail = async (req, res) => {
  const {
    company_code, transaction_date, transaction_no, warehouse_code, vendor_code, ItemSNo, item_code, item_name, bill_qty, bill_rate,
    item_amt, weight, total_weight, pay_type, purchase_type,vendor_name, order_type, hsn, tax_amount, created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_purchase_details @mode,@company_code,@transaction_date,@transaction_no,@warehouse_code,@vendor_code,@ItemSNo,@item_code,@item_name,@bill_qty,@bill_rate,
          @item_amt,@weight,@total_weight,@pay_type,@purchase_type,@vendor_name,
          @order_type,@hsn,@tax_amount,'','',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const getAllpurtaxData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_tax_details @mode,@company_code,'','','','',0,0,'','','','',0,0,'','',''
              ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addpurtaxdetail = async (req, res) => {
  const {
    company_code, transaction_date, transaction_no, vendor_code, pay_type, ItemSNo, TaxSNo, item_code, item_name, tax_type, tax_name_details, tax_amt, tax_per,created_by,

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("tax_per", sql.Decimal(14, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_purchase_tax_details @mode,@company_code,@transaction_date,@transaction_no,@vendor_code,@pay_type,@ItemSNo,@TaxSNo,@item_code,@item_name,@tax_type,@tax_name_details,
              @tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




const getTotalAmountCalculation = async (req, res) => {
  const { Tax_amount, company_code, Putchase_amount } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TOT")
      .input("Tax_amount", sql.NVarChar, Tax_amount)
      .input("Putchase_amount", sql.NVarChar, Putchase_amount)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC [sp_ItemAmountCalculation] 'TOT',@company_code,0,'',0,0,'','','',0,'', @Tax_amount, @Putchase_amount,
            NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getSalesItemAmountCalculation = async (req, res) => {
  const { company_code, Item_SNO, Item_code, bill_qty, item_amt, tax_type_header, tax_name_details, tax_percentage, UnitWeight, keyfield, discount } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IAC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_SNO", sql.BigInt, Item_SNO)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.NVarChar, tax_percentage)
      .input("UnitWeight", sql.Decimal(8, 3), UnitWeight)
      .input("keyfield", sql.NVarChar, keyfield)
      .input("discount", sql.Decimal(5, 2), discount)
      .query(`EXEC [sp_sale_ItemAmountCalculation] @mode,@company_code,@Item_SNO,@Item_code,@bill_qty,@item_amt,@tax_type_header,@tax_name_details,@tax_percentage,@UnitWeight,@keyfield,NULL,NULL,@discount,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const SalesTotalAmountCalculation = async (req, res) => {
  const { Tax_amount, sale_amt, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TOT")
      .input("Tax_amount", sql.NVarChar, Tax_amount)
      .input("sale_amt", sql.NVarChar, sale_amt)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC [sp_sale_ItemAmountCalculation] @mode,@company_code,0 ,'',0,0,'','','',0,'',@Tax_amount,@sale_amt,0,0,
                          NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const SalesreturnTotalAmountCalculation = async (req, res) => {
  const { Tax_amount, sale_amt, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TOT")
      .input("Tax_amount", sql.NVarChar, Tax_amount)
      .input("sale_amt", sql.NVarChar, sale_amt)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sale_ReturnItemAmountCalculation 'TOT',@company_code,0,'',0,0,'','','',0,@Tax_amount,@sale_amt,
                          NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getPartyCode = async (req, res) => {
  const { company_code, vendor_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "VCS")
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,'','','','','','','','','','','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getcompanymappingsearchdata = async (req, res) => {
  const { company_code, user_code, company_no, location_no, status, } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.NVarChar, user_code)
      .input("company_no", sql.NVarChar, company_no)
      .input("location_no", sql.NVarChar, location_no)
      .input("status", sql.NVarChar, status)

      .query(`EXEC sp_user_company_mapping @mode,@company_code,@user_code,@company_no,@location_no,@status,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getattributeSearchdata = async (req, res) => {
  const { company_code, attributeheader_code, attributedetails_code, attributedetails_name, descriptions } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("attributedetails_code", sql.NVarChar, attributedetails_code)
      .input("attributedetails_name", sql.NVarChar, attributedetails_name)
      .input("descriptions", sql.NVarChar, descriptions)
      .query(`EXEC sp_attribute_Info 'SC',@company_code,@attributeheader_code,@attributedetails_code,@attributedetails_name,@descriptions,'','','','','','','','','',''
                `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const addpurchasereturnheader = async (req, res) => {
  const {
    company_code,Entry_date,return_no,Return_date,return_reason,return_person,transaction_no,
    transaction_date,purchase_type,vendor_code,vendor_name,pay_type,purchase_amount_returne,
    add_fright,less_fright,tax_amount,tax_percentage,rounded_off,cartage_paid,other_charges,total_amount,created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode",              sql.NVarChar, "I") // Insert mode
      .input("company_code",      sql.NVarChar, company_code)
      .input("Entry_date",        sql.Date, Entry_date)
      .input("return_no",         sql.NVarChar, return_no)
      .input("Return_date",       sql.Date, Return_date)
      .input("return_reason",       sql.NVarChar, return_reason)
      .input("return_person",     sql.NVarChar, return_person)
      .input("transaction_no",    sql.NVarChar, transaction_no)
      .input("transaction_date", sql.Date, transaction_date)
      .input("purchase_type",     sql.NVarChar, purchase_type)
      .input("vendor_code",     sql.NVarChar, vendor_code)
      .input("vendor_name",    sql.NVarChar, vendor_name)
      .input("pay_type",        sql.NVarChar, pay_type)
      .input("purchase_amount_returne", sql.Decimal(14, 2), purchase_amount_returne)
      .input("add_fright",    sql.Decimal(14, 2), add_fright)
      .input("less_fright",   sql.Decimal(14, 2), less_fright)
      .input("tax_amount",    sql.Decimal(14, 2), tax_amount)
      .input("tax_percentage", sql.Decimal(14, 2), tax_percentage)
      .input("rounded_off",     sql.Decimal(14, 2), rounded_off)
      .input("cartage_paid", sql.Decimal(14, 2), cartage_paid)
      .input("other_charges", sql.Decimal(14, 2), other_charges)
      .input("total_amount", sql.Decimal(10, 2), total_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_return_hdr @mode,@company_code,@Entry_date,@return_no,@Return_date,@return_reason,@return_person,@transaction_no,@transaction_date,
                  @purchase_type,@vendor_code,@vendor_name,@pay_type,@purchase_amount_returne,@add_fright,@less_fright,@tax_amount,@tax_percentage,@rounded_off,
                  @cartage_paid,@other_charges,@total_amount,'','',
                  @created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
                  if (result.recordset.length > 0) {
                    res.status(200).json(result.recordset);
                  } else {
                    res.status(404).json(err.message);
                  }
                } catch (err) {
                  console.error("Error", err.message);
                  return res.status(500).json({ message: err.message || "Internal Server Error" });
                }
              };
              




const getAllpurchaseheaderreturnData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_return_hdr @mode,@company_code,'','','','','','','','','',
    '','',0,0,0,0,0,0,0,0,0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


//PURCHASE ANALYSIS BETWEEN DATE //DHANA//JUNE27 2024
const getpurchasereport = async (req, res) => {
  const { mode, StartDate, EndDate, vendor_code, company_code, Type } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode) // Insert mode
      .input("StartDate", sql.Date, StartDate)
      .input("EndDate", sql.Date, EndDate)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("Type", sql.NVarChar, Type)
      .query(`EXEC sp_PurchaseAnalysis_Rpt @mode,@StartDate,@EndDate,@vendor_code,@company_code,@Type`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else res.status(404).json({ message: "Data not found" })
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });

  }
};


//SALES ANALYSIS BETWEEN DATE //DHANA//JUNE27 2024
const getsalesreport = async (req, res) => {
  const { mode, StartDate, EndDate, customer_code, company_code, type, pay_type, order_type } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode) // Insert mode
      .input("StartDate", sql.Date, StartDate)
      .input("EndDate", sql.Date, EndDate)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("type", sql.NVarChar, type)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("order_type", sql.NVarChar, order_type)
      .query(`EXEC sp_SalesAnalysis_Rpt @mode,@StartDate,@EndDate,@customer_code,@company_code,@type,@pay_type, @order_type`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const gettaxSearchdata = async (req, res) => {
  const { company_code, tax_type_header, tax_name_details, tax_percentage, tax_shortname, tax_accountcode, transaction_type, status } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.VarChar, company_code)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.Decimal(14, 2), tax_percentage)
      .input("tax_shortname", sql.NVarChar, tax_shortname)
      .input("tax_accountcode", sql.NVarChar, tax_accountcode)
      .input("transaction_type", sql.NVarChar, transaction_type)
      .input("status", sql.NVarChar, status)
      .query(`EXEC sp_tax_name_details @mode,@company_code,@tax_type_header, @tax_name_details, @tax_percentage , @tax_shortname, @tax_accountcode, @transaction_type, @status,
                         NULL, NULL, NULL, NULL,'','','','','',''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAllsaleshdrData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(  `EXEC sp_sales_hdr_test @mode,@company_code,'','','','','',0,0,0,0,0,0,0,0,'','','',
        '','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





//Code added by Harish
const addsaleshdr = async (req, res) => {
  const {
    company_code, bill_date, bill_no, warehouse_code, sales_type, customer_code, sale_amt, net_amt, roff_amt, othr_amt, bill_amt, tax_amount, total_item, pay_type,  sman_code,
    payment_mode, customer_name, order_type, 
    sales_mode, paid_amount, return_amount, sales_order_no, created_by
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("sale_amt", sql.Decimal(14, 2), sale_amt)
      .input("net_amt", sql.Decimal(14, 2), net_amt)
      .input("roff_amt", sql.Decimal(14, 2), roff_amt)
      .input("othr_amt", sql.Decimal(14, 2), othr_amt)
      .input("bill_amt", sql.Decimal(14, 2), bill_amt)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("total_item", sql.Int, total_item)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("payment_mode", sql.NVarChar, payment_mode)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("sales_mode", sql.VarChar, sales_mode)
      .input("paid_amount", sql.Decimal(14, 2), paid_amount)
      .input("return_amount", sql.Decimal(14, 2), return_amount)
      .input("sales_order_no", sql.NVarChar, sales_order_no)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_hdr_test @mode,@company_code,@bill_date,@bill_no,@warehouse_code,@sales_type,@customer_code,@sale_amt,@net_amt,@roff_amt,@othr_amt,@bill_amt,@tax_amount,@total_item,@pay_type,@sman_code,@payment_mode,@customer_name,
        @order_type,'','',@sales_mode,@paid_amount,@return_amount,@sales_order_no,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};






const addsalesdetdetail = async (req, res) => {
  const {
    company_code,
    bill_date,
    bill_no,
    warehouse_code,
    customer_code,
    item_code,
    ItemSNo,
    item_name,
    bill_qty,
    bill_rate,
    item_amt,
    weight,
    total_weight,
    pay_type,
    sales_type,
    sman_code,
    customer_name,
    order_type,
    hsn,
    tax_amt,
    discount,
    discount_amount,
    created_by,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("item_code", sql.NVarChar, item_code)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("discount", sql.Decimal(5, 2), discount)
      .input("discount_amount", sql.Decimal(14, 2), discount_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_sales_details @mode, @company_code,@bill_date,@bill_no,@warehouse_code,@customer_code,@item_code,@ItemSNo,@item_name,@bill_qty,
        @bill_rate,@item_amt,@weight,@total_weight,@pay_type,@sales_type,@sman_code,@customer_name,@order_type,@hsn,@tax_amt,'','',@discount,@discount_amount,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


// INVENTORY HEADER AND DETAILS CRUD API CALLING CODE ENDS //

//Code added by dhana      
const gettranstype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'TRANSATION','','', '','','' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const getAllsalestaxdetData = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sales_tax_details @mode,@company_code,'','','','',0,0,'','','','',0,0,'','',''
	,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const addsalestaxdetail = async (req, res) => {
  const {
    company_code, bill_date, bill_no, customer_code, pay_type, ItemSNo, TaxSNo, item_code, item_name, tax_type, tax_name_details, tax_amt, tax_per,
    created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("tax_per", sql.Decimal(14, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_tax_details @mode,@company_code,@bill_date,@bill_no,@customer_code,@pay_type,@ItemSNo,@TaxSNo,@item_code,@item_name,@tax_type,@tax_name_details,
              @tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAllSalesRetHdrData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sales_return_hdr @mode,@company_code,'','','','','','','','','',0,0,0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const addSalesRetHdr = async (req, res) => {
  const {
    company_code, bill_date, bill_no, return_date, return_no, return_reason, return_person, warehouse_code, sales_type, customer_code, sale_amt,
    net_amt, roff_amt, othr_amt, bill_amt, total_item, total_qty, pay_type,sman_code,payment_mode,
    customer_name, order_type, tax_amount, created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("return_date", sql.Date, return_date)
      .input("return_no", sql.NVarChar, return_no)
      .input("return_reason", sql.NVarChar, return_reason)
      .input("return_person", sql.NVarChar, return_person)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("sale_amt", sql.Decimal(14, 2), sale_amt)
      .input("net_amt", sql.Decimal(14, 2), net_amt)
      .input("roff_amt", sql.Decimal(14, 2), roff_amt)
      .input("othr_amt", sql.Decimal(14, 2), othr_amt)
      .input("bill_amt", sql.Decimal(14, 2), bill_amt)
      .input("total_item", sql.Int, total_item)
      .input("total_qty", sql.Int, total_qty)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("payment_mode", sql.NVarChar, payment_mode)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_sales_return_hdr @mode,@company_code,@bill_date,@bill_no,@return_date,@return_no,@return_reason,@return_person,@warehouse_code,@sales_type,	
                  @customer_code,@sale_amt,@net_amt,@roff_amt,@othr_amt,@bill_amt,@total_item,
                  @total_qty,@pay_type,@sman_code,@payment_mode,@customer_name,@order_type,
                  @tax_amount,'','',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }
};



//NUMBERSERIES       

const getAllNumberseries = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_numberseries 'A','','','','',0,0,0,'','','','','',
                         null,null,null,null,null,null,null,null,''`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//ADD DATAS IN Intermediary  DETAILS  TABLE
const addNumberseries = async (req, res) => {
  const {
    company_code,
    Screen_Type,
    Start_Year,
    End_Year,
    Start_No,
    Running_No,
    End_No,
    comtext,
    number_prefix,
    status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("Screen_Type", sql.NVarChar, Screen_Type)
      .input("Start_Year", sql.Date, Start_Year)
      .input("End_Year", sql.Date, End_Year)
      .input("Start_No", sql.Int, Start_No)
      .input("Running_No", sql.Int, Running_No)
      .input("End_No", sql.Int, End_No)
      .input("comtext", sql.NVarChar, comtext)
      .input("number_prefix", sql.NVarChar, number_prefix)
      .input("Status", sql.NVarChar, status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_numberseries @mode,@company_code,@Screen_Type,@Start_Year,@End_Year,@Start_No,@Running_No,@End_No,@comtext,@number_prefix,@Status,
                     @created_by,@modified_by, @tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4,''`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};

const getnumberseriessearchdata = async (req, res) => {
  const { company_code, Screen_Type } = req.body; // Extract Screen_Type from req.body

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Screen_Type", sql.NVarChar, Screen_Type) // Correct parameter name
      .query(`EXEC sp_numberseries @mode,@company_code,@Screen_Type,'','',0,0,0,'','','','','',
                         null,null,null,null,null,null,null,null,''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const saveEditedNumberseriesData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", updatedRow.company_code)
        .input("Screen_Type", updatedRow.Screen_Type)
        .input("Start_Year", updatedRow.Start_Year)
        .input("End_Year", updatedRow.End_Year)
        .input("Start_No", updatedRow.Start_No)
        .input("Running_No", updatedRow.Running_No)
        .input("End_No", updatedRow.End_No)
        .input("comtext", updatedRow.comtext)
        .input("number_prefix", updatedRow.number_prefix)
        .input("Status", updatedRow.Status)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_numberseries @mode, @company_code,@Screen_Type, @Start_Year, @End_Year, @Start_No, @Running_No, @End_No,@comtext,@number_prefix,@Status,
                                @created_by,@modified_by,@tempstr1, @tempstr2, @tempstr3, @tempstr4, 
                              @datetime1, @datetime2, @datetime3, @datetime4,''`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const refNumberToHeaderPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}


const refNumberToDetailPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool.request()
      .input("mode", sql.NVarChar, "PD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Process result sets
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const refNumberToSumTax = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PP")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const refNumberTosalesHeaderPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}


const refNumberTosalesDetailPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool.request()
      .input("mode", sql.NVarChar, "SD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Process result sets
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const refNumberTosalesSumTax = async (req, res) => {
  const { transaction_no, company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SP")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getAllDashboardData = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "plb")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard @mode,@company_code,0,0,0,'',''`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getItemPrice = async (req, res) => {
  const { Item_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "GV")
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_item_brand_info @mode,'',@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','','','',
        '',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getProduct = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PN")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_itemcalculate_stock_value  @mode,'',@company_code`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPurchaseReturnItemAmountCalculation = async (req, res) => {
  const {company_code, Item_SNO, Item_code, return_qty, purchaser_amt, tax_type_header, tax_name_details, tax_percentage, UnitWeight } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IAC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_SNO", sql.BigInt, Item_SNO)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("return_qty", sql.Decimal(10, 2), return_qty)
      .input("purchaser_amt", sql.Decimal(10, 2), purchaser_amt)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.NVarChar, tax_percentage)
      .input("UnitWeight", sql.Decimal(8, 3), UnitWeight)
      .query(`EXEC [sp_returnItemAmountCalculation] 'IAC',@company_code,@Item_SNO,@Item_code,@return_qty,@purchaser_amt,@tax_type_header,@tax_name_details,@tax_percentage,@UnitWeight,'','',
                          NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Code by Harish kumar
const getSalesReturnItemAmountCalculation = async (req, res) => {
  const { Item_SNO, Item_code, Tax_amount, bill_rate, return_qty, item_amt, tax_type_header, tax_name_details, tax_percentage, UnitWeight } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IAC")
      .input("Item_SNO", sql.BigInt, Item_SNO)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("return_qty", sql.Decimal(10, 2), return_qty)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.NVarChar, tax_percentage)
      .input("UnitWeight", sql.Decimal(8, 3), UnitWeight)
      .input("Tax_amount", sql.NVarChar, Tax_amount)
      .input("bill_rate", sql.NVarChar, bill_rate)
      .query(`EXEC [sp_sale_ReturnItemAmountCalculation] 'IAC','',@Item_SNO,@Item_code,@return_qty,@item_amt,@tax_type_header,@tax_name_details,@tax_percentage,@UnitWeight,@Tax_amount,@bill_rate,
                          NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

/* CODE ADDED BY PAVUN */
const getDashboardItemData = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TIC")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard @mode,@company_code,0,0,0,'',''`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDashboardStockData = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TSV")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_calculate_stock_value @mode,@company_code`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getitemstockvalue = async (req, res) => {
  const { item_code, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input('mode', sql.NVarChar, 'ISV')
      .input('item_code', sql.NVarChar, item_code)
      .input('company_code', sql.NVarChar, company_code)
      .query(`EXEC sp_itemcalculate_stock_value @mode,@item_code,@company_code`);

    // Send response
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getAllItemVarient = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input('mode', sql.NVarChar, 'IV')
      .input('company_code', sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,'','','',0,'','','',0,0,0,0,'','','','','','','','','','',
        '',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//ITEM VARIENT NAME FOR DASHBOARD//DHANA//29JUNE2024
const getitemvairentname = async (req, res) => {
  const { Item_variant, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input('mode', sql.NVarChar, 'FIV')
      .input('Item_variant', sql.NVarChar, Item_variant)
      .input('company_code', sql.NVarChar, company_code)
      .query('EXEC sp_ItemVariantCounts @mode,@Item_variant,@company_code');

    // Send response
    if (result.recordset && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json('Data not found'); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAllUOM = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "UOM")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_item_uom @mode,'',@company_code`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAlluomdetail = async (req, res) => {
  const { UOM, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "BUOM")
      .input("UOM", sql.NVarChar, UOM)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_item_uom @mode,@UOM,@company_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code added by harish kumar on 07/03/2024//
const getusercompany = async (req, res) => {
  const { user_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "UCL") // Insert mode
      .input("user_code", sql.NVarChar, user_code)
      .query(
        `EXEC sp_user_company_mapping @mode,'',@user_code,'','','',0,'','','',
                              NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
// code ended by harishkumar  07/03/2024

const numberseriesdeleteData = async (req, res) => {
  const Screen_TypesToDelete = req.body.Screen_TypesToDelete;

  if (!Screen_TypesToDelete || !Screen_TypesToDelete.length) {
    res.status(400).json("Invalid or empty company_nos array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of Screen_TypesToDelete) {
      try {
        await pool.request()
          .input("Screen_Type", updatedRow.Screen_Type)
          .input("Start_Year", updatedRow.Start_Year)
          .input("End_Year", updatedRow.End_Year)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .query(`EXEC sp_numberseries 'D',@company_code,@Screen_Type,@Start_Year,@End_Year,0,0,0,'','','','',@modified_by, null,null,null,null,null,null,null,null,''`);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The number series cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("Number series deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getonlywarehsearchdata = async (req, res) => {
  const { company_code, warehouse_code, warehouse_name, status, location_no } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SCS")
      .input("company_code", sql.NVarChar, company_code)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("warehouse_name", sql.NVarChar, warehouse_name)
      .input("status", sql.NVarChar, status)
      .input("location_no", sql.NVarChar, location_no)
      .query(` EXEC sp_warehouse_info @mode,@company_code,@warehouse_code,@warehouse_name,@status,@location_no,'','','','',NULL,NULL,NULL,NULL,'',''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const updcompanymapping = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("user_code", updatedRow.user_code)
        .input("company_no", updatedRow.company_no)
        .input("location_no", updatedRow.location_no)
        .input("status", updatedRow.status)
        .input("order_no", updatedRow.order_no)
        .input("keyfiels", updatedRow.keyfiels)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_user_company_mapping @mode, @company_code, @user_code, @company_no, @location_no, 
                                @status, @order_no,@keyfiels,@created_by,@modified_by,
                               @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
                              @datetime1, @datetime2, @datetime3, @datetime4`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const commappingdeleteData = async (req, res) => {
  const keyfielsToDelete = req.body.keyfiels;


  try {
    const pool = await connection.connectToDatabase();


    for (const keyfiels of keyfielsToDelete) {
      try {
        await pool.request()
          .input("keyfiels", keyfiels)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`EXEC sp_user_company_mapping 'D','','','','001','',0,@keyfiels,'','',
                                NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The user rights cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("User and company mapping data deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};


const getSalesTaxDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "ST")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};

const getSalesDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};

const getSalesData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "S")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [],
        table3: result.recordsets[2] || [],
        table4: result.recordsets[3] || []
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code added by harish kum,ar on 07/04/2024 code ends//

//code added by pavun on 07/04/2024 code begins //
const getWarehouseCodeData = async (req, res) => {
  const { warehouse_code, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "WD")
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_warehouse_info @mode, @company_code,@warehouse_code, '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);

    // Check if result.recordset is defined and has length greater than 0
    if (result.recordset && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//code added by pavun on 07/04/2024 code ends //

//USER SCREEN MAPPING 06/07/2024  DHANA//   

const getAlluserscreenmap = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_rolescreen_mapping 'A','','','','','','','',
                                      null,null,null,null,null,null,null,null `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const adduserscreenmap = async (req, res) => {
  const {
    company_code,
    role_id,
    screen_type,
    permission_type,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("role_id", sql.VarChar, role_id)
      .input("screen_type", sql.NVarChar, screen_type)
      .input("permission_type", sql.VarChar, permission_type)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_rolescreen_mapping @mode, @company_code,@role_id, @screen_type,@permission_type,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};
//USER SCREEN MAPPING UPDATE 06/07/2024 DHANA//
const saveEditeduserscreenmap = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", updatedRow.company_code)
        .input("role_id", updatedRow.role_id)
        .input("screen_type", updatedRow.screen_type)
        .input("permission_type", updatedRow.permission_type)
        .input("keyfield", updatedRow.keyfield)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_rolescreen_mapping @mode,@company_code, @role_id, @screen_type, @permission_type, @keyfield,'', @modified_by,  
               @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
              @datetime1, @datetime2, @datetime3, @datetime4`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//USER SCREEN MAPPING DELETE 06/07/2024 DHANA//
const userscreenmapdeleteData = async (req, res) => {
  const keyfieldsToDelete = req.body.keyfield;

  // if (!keyfieldsToDelete || !keyfieldsToDelete.length) {
  //   res.status(400).json("Invalid or empty company_nos array.");
  //   return;
  // }

  try {
    const pool = await connection.connectToDatabase();

    for (const keyfield of keyfieldsToDelete) {
      try {
        await pool.request().input("keyfield", keyfield)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`EXEC sp_rolescreen_mapping 'D','','','','',@keyfield,'',@modified_by,null,null,null,null,null,null,null,null`);
      } catch (error) {
        if (error.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The user rights cannot be deleted due to a link with another record");
          return;
        } else {
          throw error; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("User screen mapping deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getuserscreensearchdata = async (req, res) => {
  const { company_code, role_id, screen_type, permission_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.VarChar, company_code)
      .input("role_id", sql.VarChar, role_id)
      .input("screen_type", sql.NVarChar, screen_type)
      .input("permission_type", sql.NVarChar, permission_type)
      .query(`EXEC sp_rolescreen_mapping @mode,@company_code,@role_id,@screen_type,@permission_type,'','','',
null,null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};
//DROPDOWN FOR USER SCREEN MAPPING 06/07/2024 DHANA    

const getScreens = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Screens','',' ', ' ','','' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPermissions = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Permissions','',' ', ' ' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getAllSalesRetDetailData = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sales_return_details @mode,@company_code,'','','','','','','','','','',0,0,0,0,0,0,0,'','','','','','',0,0,0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const addSalesRetDetail = async (req, res) => {
  const {
    company_code, bill_date, bill_no, return_date, return_no, return_reason, return_person, warehouse_code,
    customer_code, item_code, item_name, bill_qty, return_qty, bill_rate, item_amt, weight, return_weight, total_weight, pay_type, sales_type,sman_code,customer_name, order_type, hsn, return_amt, tax_amt, ItemSNo, created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("return_date", sql.Date, return_date)
      .input("return_no", sql.NVarChar, return_no)
      .input("return_reason", sql.NVarChar, return_reason)
      .input("return_person", sql.NVarChar, return_person)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("return_qty", sql.Decimal(10, 2), return_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("return_weight", sql.Decimal(8, 3), return_weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("return_amt", sql.Decimal(10, 2), return_amt)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_sales_return_details @mode,@company_code,@bill_date,@bill_no,@return_date,@return_no,@return_reason,@return_person,@warehouse_code,
          @customer_code,@item_code,@item_name,@bill_qty,@return_qty,@bill_rate,@item_amt,@weight,@return_weight,
          @total_weight,@pay_type,@sales_type,@sman_code
          ,@customer_name,@order_type,@hsn,@return_amt,@tax_amt, @ItemSNo,'','', @created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getAllSalesRetTaxDetailData = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sales_return_tax_details @mode,@company_code,'','','','','','','','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const addSalesRetTaxDetail = async (req, res) => {
  const {
    company_code, bill_date, bill_no, return_no, return_date, return_reason, return_person,
    customer_code, item_code, item_name, ItemSNo, TaxSNo, tax_type, tax_name_details, tax_amt, tax_per, pay_type,created_by

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("return_no", sql.NVarChar, return_no)
      .input("return_date", sql.Date, return_date)
      .input("return_reason", sql.NVarChar, return_reason)
      .input("return_person", sql.NVarChar, return_person)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(10, 2), tax_amt)
      .input("tax_per", sql.Decimal(10, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_sales_return_tax_details @mode,@company_code,@bill_date, @bill_no, @return_no, @return_date, @return_reason, @return_person,@customer_code, @pay_type, @ItemSNo, @TaxSNo, @item_code,  @item_name, @tax_type, @tax_name_details, @tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



//CUSTOMER 06/07/2024  DHANA//   



const getAllcustomerhdr = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_customer_info_hdr 'A',@company_code,'','','','','','','','',null,
                          null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const addcustomerhdr = async (req, res) => {
  const {
    company_code,
    customer_code,
    customer_name,
    status,
    customer_logo,
    panno,
    customer_gst_no,
    created_by,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("status", sql.NVarChar, status)
      .input("customer_logo", sql.NVarChar, customer_logo)
      .input("panno", sql.NVarChar, panno)
      .input("customer_gst_no", sql.NVarChar, customer_gst_no)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_customer_info_hdr @mode,@company_code,@customer_code,@customer_name,@status,@customer_logo,@panno,@customer_gst_no,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    if (err.class === 16 && err.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: err.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};


// CUSTOMER DET INFO//
const getAllCustomerDetData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_customer_details_info 'A','','','','','','','','','','','','',
       '','','','','','','',0,'','','','','','','','','','',NULL,NULL,NULL,null,null,null,null,null`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addCustomerDetData = async (req, res) => {
  const {
    customer_code,
    company_code,
    customer_addr_1,
    customer_addr_2,
    customer_addr_3,
    customer_addr_4,
    customer_area,
    customer_state,
    customer_country,
    customer_office_no,
    customer_resi_no,
    customer_mobile_no,
    customer_email_id,
    customer_credit_limit,
    customer_salesman_code,
    contact_person,
    office_type,
    default_customer,
    created_by
  } = req.body;

  let pool;
  try {
    pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("customer_code", sql.VarChar, customer_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_addr_1", sql.VarChar, customer_addr_1)
      .input("customer_addr_2", sql.VarChar, customer_addr_2)
      .input("customer_addr_3", sql.VarChar, customer_addr_3)
      .input("customer_addr_4", sql.VarChar, customer_addr_4)
      .input("customer_area", sql.VarChar, customer_area)
      .input("customer_state", sql.VarChar, customer_state)
      .input("customer_country", sql.VarChar, customer_country)
      .input("customer_office_no", sql.NVarChar, customer_office_no)
      .input("customer_resi_no", sql.NVarChar, customer_resi_no)
      .input("customer_mobile_no", sql.NVarChar, customer_mobile_no)
      .input("customer_email_id", sql.NVarChar, customer_email_id)
      .input("customer_credit_limit", sql.Decimal(14, 3), customer_credit_limit)
      .input("customer_salesman_code", sql.NVarChar, customer_salesman_code)
      .input("contact_person", sql.NVarChar, contact_person)
      .input("office_type", sql.NVarChar, office_type)
      .input("default_customer", sql.NVarChar, default_customer)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_customer_details_info @mode,@customer_code,@company_code,'', '', '', '', @customer_addr_1, @customer_addr_2, @customer_addr_3, @customer_addr_4,@customer_area,
        @customer_state, @customer_country, @customer_office_no, @customer_resi_no, @customer_mobile_no,@customer_email_id, 
         @customer_credit_limit,@customer_salesman_code,@contact_person,@office_type,@default_customer,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );


    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};

// CUSTOMER UPDATE 07/07/2024 DHANA //
const updcustomerdetData = async (req, res) => {
  const { customer_codesToUpdate, company_codesToUpdate, updatedData } = req.body;

  if (!customer_codesToUpdate || !customer_codesToUpdate.length ||
    !company_codesToUpdate || !company_codesToUpdate.length ||
    !updatedData || !updatedData.length) {
    return res.status(400).json("Invalid or empty input data.");
  }

  try {
    const pool = await connection.connectToDatabase();

    for (let i = 0; i < customer_codesToUpdate.length; i++) {
      const updatedRow = updatedData[i]; // Assuming updatedData is an array of objects with updated values

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("customer_code", customer_codesToUpdate[i])
        .input("company_code", company_codesToUpdate[i])
        .input("customer_addr_1", sql.NVarChar, updatedRow.customer_addr_1)
        .input("status", sql.NVarChar, updatedRow.status)
        .input("customer_addr_2", sql.NVarChar, updatedRow.customer_addr_2)
        .input("customer_addr_3", sql.NVarChar, updatedRow.customer_addr_3)
        .input("customer_addr_4", sql.NVarChar, updatedRow.customer_addr_4)
        .input("customer_area", sql.NVarChar, updatedRow.customer_area)
        .input("customer_state", sql.NVarChar, updatedRow.customer_state)
        .input("customer_country", sql.NVarChar, updatedRow.customer_country)
        .input("customer_office_no", sql.NVarChar, updatedRow.customer_office_no)
        .input("customer_resi_no", sql.NVarChar, updatedRow.customer_resi_no)
        .input("customer_mobile_no", sql.NVarChar, updatedRow.customer_mobile_no)
        .input("customer_email_id", sql.NVarChar, updatedRow.customer_email_id)
        .input("customer_credit_limit", sql.Decimal(14, 3), updatedRow.customer_credit_limit)
        .input("customer_salesman_code", sql.NVarChar, updatedRow.customer_salesman_code)
        .input("contact_person", sql.NVarChar, updatedRow.contact_person)
        .input("office_type", sql.NVarChar, updatedRow.office_type)
        .input("default_customer", sql.NVarChar, updatedRow.default_customer)
        .input("keyfield", sql.NVarChar, updatedRow.keyfield)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(
          `EXEC sp_customer_details_info @mode,@customer_code,@company_code,'',@status, '', '', @customer_addr_1, @customer_addr_2, @customer_addr_3, @customer_addr_4,@customer_area,
        @customer_state, @customer_country, @customer_office_no, @customer_resi_no, @customer_mobile_no,@customer_email_id, 
         @customer_credit_limit,@customer_salesman_code,@contact_person,@office_type,@default_customer,@keyfield,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
        );
    }

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// CUSTOMER SEARCH CRITERIA 07/07/2024 DHANA //
const customerSearchdata = async (req, res) => {
  const { company_code, customer_code, customer_name, panno, customer_gst_no, customer_addr_1, customer_area, customer_state, customer_country, customer_mobile_no, status, default_customer } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("status", sql.NVarChar, status)
      .input("panno", sql.NVarChar, panno)
      .input("customer_gst_no", sql.NVarChar, customer_gst_no)
      .input("customer_addr_1", sql.NVarChar, customer_addr_1)
      .input("customer_area", sql.NVarChar, customer_area)
      .input("customer_state", sql.NVarChar, customer_state)
      .input("customer_country", sql.NVarChar, customer_country)
      .input("customer_mobile_no", sql.NVarChar, customer_mobile_no)
      .input("default_customer", sql.NVarChar, default_customer)
      .query(`EXEC sp_customer_details_info @mode,@customer_code,@company_code,@customer_name,@status,@panno,@customer_gst_no,@customer_addr_1,'','','',@customer_area,@customer_state,
      @customer_country,'','',@customer_mobile_no,'',0,'','','',@default_customer,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getcustomercode = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "F")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_customer_info_hdr @mode,@company_code,'','','','','','','','',null,
                        null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
// CUSTOMER DELETE 07/07/2024 DHANA //

const customerdeleteData = async (req, res) => {
  const { keyfieldsToDelete } = req.body;

  if (!keyfieldsToDelete || !keyfieldsToDelete.length) {
    res.status(400).json("Invalid or empty Codes or codeDetails array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    const deleteQuery = `EXEC sp_customer_details_info 'D','',@company_code,'','','','','','','','','','','','','','','',0,'','','','',@keyfield,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`;
    for (let i = 0; i < keyfieldsToDelete.length; i++) {

      await pool.request()
        .input("keyfield", keyfieldsToDelete[i])
        .input("company_code", sql.NVarChar, req.headers['company-code'])
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(deleteQuery);
    }


    res.status(200).json("Customer data deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





//CODE ADDED BY PAVUN 11/07/2024 BEGIN //
const refNumberToPurchaseReturnHeaderPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PRH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}


const refNumberToPurchaseReturnDetailPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool.request()
      .input("mode", sql.NVarChar, "PRD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Process result sets
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const refNumberToPurachseReturnSumTax = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PR")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const refNumberToSalesReturnHeaderPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SRH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}


const refNumberToSalesReturnDetailPrintData = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool.request()
      .input("mode", sql.NVarChar, "SRD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Process result sets
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};

const refNumberToSalesReturnSumTax = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SR")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getItemCodeSalesData = async (req, res) => {
  const { company_code, Item_code, type } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIIC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("type", sql.NVarChar, type)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','','','',
        '',0,0,@type,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getCustomerCode = async (req, res) => {
  const { company_code, customer_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CCS")
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .query(`EXEC sp_customer_details_info @mode,@customer_code,@company_code,'','','','','','','','','','','','','','','',0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);// 200 OK if data is found
    } else {
      res.status(404).json("Data not found");// 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};









//CODE ADDED BY KATHIRAVAN ARUMUGAM FOR DELETE PURCHASE 
const purdeletehdrData = async (req, res) => {
  // const purch_autonosToDelete = req.body.purch_autonos;
  const { company_code, transaction_no, modified_by } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("transaction_no", transaction_no)
        .input("modified_by", modified_by)
        .query(`EXEC sp_purchase_hdr_test 'D',@company_code,'',@transaction_no,'','','','','',
          0,0,0,0,0,0,0,0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("first delete the purchase details and tax details data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};


//Code added By Pavun 15-07-2024
const saledeletehdrData = async (req, res) => {
  const { company_code, bill_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("bill_no", bill_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_hdr_test 'D',@company_code,'',@bill_no,'','','',0,0,0,0,0,0,0,0,'','','',
        '','','','',0,0,'','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Sales deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const saleDeleteDetailData = async (req, res) => {
  const { bill_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {

      await pool.request()
        .input("mode", sql.NVarChar, "D")
        .input("bill_no", bill_no)
        .input("company_code", company_code)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_details @mode,@company_code,'',@bill_no,'','','',0,'',0,
        0,0,0,0,'','','','','','',0,'','',0,0,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }
    res.status(200).json("Sales Deleted Successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const saleDeleteTaxData = async (req, res) => {
  const { company_code, bill_no } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("bill_no", bill_no)
        .query(`EXEC sp_sales_tax_details'D',@company_code,'',@bill_no,'','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
          `);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }
    res.status(200).json("Sales deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};
const getUserPermission = async (req, res) => {
  const { role_id } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "UP")
      .input("role_id", sql.NVarChar, role_id)
      .query(`EXEC sp_rolescreen_mapping @mode,'',@role_id,'','','','','',null,null,null,null,null,null,null,null
  `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};


const purDeleteDetailData = async (req, res) => {
  const { company_code, transaction_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("transaction_no", transaction_no)
        .input("company_code", company_code)
        .query(`EXEC sp_purchase_details 'D',@company_code,'',@transaction_no,'','',0,'','',0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("first delete the purchase details and tax details data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }
    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const purDeleteTaxData = async (req, res) => {
  const { company_code, transaction_no } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("transaction_no", transaction_no)
        .query(`EXEC sp_purchase_tax_details 'D',@company_code,'',@transaction_no,'','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("first delete the purchase details and tax details data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }
    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};


//Code added by harish on 18-07-2024 
const getPurchaseDeleteDetails = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PDD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Check if data is found
    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], // Provide an empty array if no data
        table3: result.recordsets[2] || []  // Provide an empty array if no data
      };
      res.status(200).json(data); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};





///test from kathir on 18-07-2024




const purdeletedunit = async (req, res) => {
  const { transaction_no,company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DPD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)

      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const purdeletedtax = async (req, res) => {
  const { transaction_no,company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DPT")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//Code Ended by harish on 18-07-2024



//Code added By harish 23-07-2024
const getRefSalesDelete = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode",              sql.NVarChar, "SDD")
      .input("transaction_no",    sql.NVarChar, transaction_no)
      .input("company_code",      sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], 
        table3: result.recordsets[2] || [],  
        table4: result.recordsets[3] || [] 
      };
      res.status(200).json(data); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getsalesdelsearchdata = async (req, res) => {
  const { company_code, bill_date, bill_no, sales_type, customer_code, customer_name, pay_type, order_type } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SCD")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.NVarChar, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("order_type", sql.NVarChar, order_type)
      .query(`EXEC sp_sales_hdr_test @mode,@company_code,@bill_date,@bill_no,'',@sales_type,@customer_code,
              0,0,0,0,0,0,0,@pay_type,'','',
              @customer_name,@order_type,'','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};

const saledelsearchitem = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DSD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const salesdelsearchtax = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DST")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata  @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


//code added by pavun 29-07-2024

const getDashboardPurchase = async (req, res) => {
  const { mode, StartDate, EndDate, company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode) // Insert mode
      .input("StartDate", sql.NVarChar, StartDate)
      .input("EndDate", sql.NVarChar, EndDate)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_purchase_chart @mode,@StartDate,@EndDate,@company_code`);
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    }
    else {
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};


//code added by pavun 30-07-2024
const getDashboardSales = async (req, res) => {
  const { mode, StartDate, EndDate, company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode) // Insert mode
      .input("StartDate", sql.NVarChar, StartDate)
      .input("EndDate", sql.NVarChar, EndDate)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_sales_chart @mode,@StartDate,@EndDate,@company_code`);
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};


const getDashboardItemSales = async (req, res) => {
  const { mode, StartDate, EndDate, company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode) // Insert mode
      .input("StartDate", sql.NVarChar, StartDate)
      .input("EndDate", sql.NVarChar, EndDate)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_itemsales_chart @mode,@StartDate,@EndDate,@company_code`);
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    }
    else {
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};






//Code added by pavun 05-08-2024
const getCurrentStock = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CS")
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_dashboard_stock @mode,@company_code,''`
      );

    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getNegativeStock = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "NS")
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_dashboard_stock @mode,@company_code,'' `
      );

    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




//warehouseDashboard  08/08/2024 DHANA//
const warehouseDashboard = async (req, res) => {
  const { warehouse_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .query(`EXEC sp_warehouse_dashboard @warehouse_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const getwarehousedrop = async (req, res) => {
  try {
    await connection.connectToDatabase();

    // Create a new SQL request
    const request = new sql.Request();

    // Add input parameter
    request.input("company_code", sql.NVarChar, req.body.company_code); // Assuming 'company_code' is sent in the request body

    // Execute the stored procedure
    const result = await request.query(
      "EXEC [sp_warehouse_info] 'FW', @company_code, '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const deleteTaxData = async (req, res) => {
  const { tax_type_headersToDelete, tax_name_detailsToDelete } = req.body;

  if (!tax_type_headersToDelete || !tax_type_headersToDelete.length || !tax_name_detailsToDelete || !tax_name_detailsToDelete.length) {
    res.status(400).json("Invalid or empty Codes or codeDetails array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    const deleteQuery = `EXEC [sp_tax_name_details] 'D',@company_code,@tax_type_header,@tax_name_details,0,'','','','','','',
                          NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`;
    for (let i = 0; i < tax_type_headersToDelete.length; i++) {
      try {
        await pool.request()
          .input("company_code", sql.VarChar, req.headers['company_code'])
          .input("tax_type_header", tax_type_headersToDelete[i])
          .input("tax_name_details", tax_name_detailsToDelete[i])
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(deleteQuery);
      } catch (err) {
        if (err.number === 50000) {
          // Foreign key constraint violation
          res.status(400).json("The tax cannot be deleted due to a link with another record");
          return;
        } else {
          throw err; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).json("Tax data deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const updTaxdetData = async (req, res) => {
  const { tax_type_headersToUpdate, tax_name_detailssToUpdate, updatedData } = req.body;

  if (!tax_type_headersToUpdate || !tax_type_headersToUpdate.length ||
    !tax_name_detailssToUpdate || !tax_name_detailssToUpdate.length ||
    !updatedData || !updatedData.length) {
    res.status(400).json("Invalid or empty input data.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (let i = 0; i < tax_type_headersToUpdate.length; i++) {
      const updatedRow = updatedData[i]; // Assuming updatedData is an array of objects with updated values

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.VarChar, req.headers['company_code'])
        .input("tax_type_header", tax_type_headersToUpdate[i])
        .input("tax_name_details", tax_name_detailssToUpdate[i])
        .input("tax_accountcode", sql.NVarChar, updatedRow.tax_accountcode)
        .input("tax_percentage", sql.Decimal(14, 2), updatedRow.tax_percentage)
        .input("tax_shortname", sql.NVarChar, updatedRow.tax_shortname)
        .input("transaction_type", sql.NVarChar, updatedRow.transaction_type)
        .input("status", sql.NVarChar, updatedRow.status)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_tax_name_details @mode,@company_code,@tax_type_header, @tax_name_details, @tax_percentage, @tax_shortname, @tax_accountcode,
            @transaction_type, @status,@created_by,@modified_by, @tempstr1, @tempstr2, @tempstr3, @tempstr4, @datetime1, @datetime2,
            @datetime3, @datetime4`
        );
    }

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getpurchasereturnView = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PR")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
 `);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], // Provide an empty array if no data
        table3: result.recordsets[2] || []  // Provide an empty array if no data
      };
      res.status(200).json(data); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



//Uomchart  08/08/2024 AK//
const UomChart = async (req, res) => {
  const { UOM } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("UOM", sql.NVarChar, UOM)
      .query(`EXEC sp_dashboard_item_uom_chart @uom`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const Transdetail = async (req, res) => {
  const { mode, item_code, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("item_code", sql.NVarChar, item_code)
      .input("company_code", sql.NVarChar, company_code)
      .query(` EXEC sp_dashboard_TransactionDetails @mode,@item_code,'','','',@company_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const partytransdetail = async (req, res) => {
  const { mode, item_code, party_code, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("item_code", sql.NVarChar, item_code)
      .input("party_code", sql.NVarChar, party_code)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_TransactionDetails @mode,@item_code,@party_code,'','',@company_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const alltransdetail = async (req, res) => {
  const { mode, item_code, party_code, start_date, end_date, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("item_code", sql.NVarChar, item_code)
      .input("party_code", sql.NVarChar, party_code)
      .input("start_date", sql.NVarChar, start_date)
      .input("end_date", sql.NVarChar, end_date)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_TransactionDetails @mode,@item_code,@party_code,@start_date,@end_date,@company_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const datetransdetail = async (req, res) => {
  const { mode, item_code, start_date, end_date, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("item_code", sql.NVarChar, item_code)
      .input("start_date", sql.NVarChar, start_date)
      .input("end_date", sql.NVarChar, end_date)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_TransactionDetails @mode,@item_code,'',@start_date,@end_date,@company_code`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



//code added by harish on 09-08-2024
const getSalesreturnView = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SR")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)

      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_getdata 'SR',@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], // Provide an empty array if no data
        table3: result.recordsets[2] || []  // Provide an empty array if no data
      };
      res.status(200).json(data); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getpurreturnsearchViewdata = async (req, res) => {
  const { company_code, return_no, transaction_date, transaction_no, vendor_name, vendor_code, purchase_type, pay_type, } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("pay_type", sql.NVarChar, pay_type)

      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_purchase_return_hdr @mode,@company_code,'',@return_no,'','','',@transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,0,0,0,0,0,0,0,0,0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//code added by pavun 10/08/2024
const varientChart = async (req, res) => {
  const { Item_variant } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("Item_variant", sql.NVarChar, Item_variant)
      .query(` EXEC [sp_dashboard_item_varaiant_chart] @Item_variant`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getsalesreturnsearchViewdata = async (req, res) => {
  const { company_code, bill_date, bill_no, return_no, sales_type, customer_code, customer_name, pay_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SSR")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.NVarChar, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("return_no", sql.NVarChar, return_no)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("pay_type", sql.NVarChar, pay_type)

      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_sales_return_hdr @mode,@company_code,@bill_date,@bill_no,'',@return_no,'','','',@sales_type,@customer_code,0,0,0,0,0,0,0,@pay_type,'','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const SalesReturnTaxView = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SRT")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)

      .query(`EXEC sp_getdata 'SRT',@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const SalesReturnDetailView = async (req, res) => {
  const { transaction_no,company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SRD")
      .input("transaction_no", sql.NVarChar, transaction_no)
            .input("company_code", sql.NVarChar, company_code)


      // .input("status", sql.NVarChar, status)
      .query(`EXEC sp_getdata 'SRD',@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getitemsalsearchdata = async (req, res) => {
  const { company_code, Item_code, Item_name, type, Item_variant, Item_short_name, Item_Our_Brand, status } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STI")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .input("Item_name", sql.NVarChar, Item_name)
      .input("Item_short_name", sql.NVarChar, Item_short_name)
      .input("Item_Our_Brand", sql.NVarChar, Item_Our_Brand)
      .input("status", sql.NVarChar, status)
      .input("type", sql.NVarChar, type)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,@Item_variant,@Item_name,0,'','',@Item_short_name,0,0,0,0,'','','','','',@Item_Our_Brand,@status,
        '','','','',0,0,@type,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const gettransdetailchart = async (req, res) => {
  const { mode, Item_code, start_date, End_Date, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("start_date", sql.NVarChar, start_date)
      .input("End_Date", sql.NVarChar, End_Date)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_dashboard_TransactionDetails_chart @mode,@Item_code,@start_date,@End_Date,@company_code`);

    // Send response
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getpurchasereturntaxView = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PRT")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode ,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getpurchasereturnitView = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PRD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDateRange = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_DateRangeList 'FD',0,''`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const getacctype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'account type','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};






const getofftype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'OfficeType','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const getItemCodeQuotation = async (req, res) => {
  const { Item_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STPI")
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_item_brand_info @mode,'',@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','','','',
        '',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getItemCodeDcData = async (req, res) => {
  const { Item_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIDC")
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_item_brand_info @mode,'',@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','','','',
        '',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const purreturndeletehdrData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("return_no", return_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_purchase_return_hdr 'D',@company_code,'',@return_no,'','','','','','','',
    '','',0,0,0,0,0,0,0,0,0,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the purchase Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Purchase return deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const purreturndeletedetData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("return_no", return_no)
        .input("company_code", company_code)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_purchase_return_details
            'D',@company_code,'','','',@return_no,'','','','','',0,0,0,0,0,0,0,'','','','','','',0,'',0,0,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the purchase Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Purchase return deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};


const purreturndeletetaxdetData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("return_no", return_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_purchase_return_tax_details 'D',@company_code,'',@return_no,'','','','','','',0,0,'','','','',0,0,'','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).Json("First Delete the purchase Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Purchase return deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};


const salereturndeletehdrData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("return_no", return_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_return_hdr 'D',@company_code,'','','',@return_no,'','','','','',0,0,0,0,0,0,0,'','','','','',0,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Sales return deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const salereturndeletedetData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("return_no", return_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_return_details 'D',@company_code,'','','',@return_no,'','','','','','',0,0,0,0,0,0,0,'','','','','','',0,0,0,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Sales return deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const salereturndeletetaxdetData = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    try {
      await pool.request()
        .input("company_code", company_code)
        .input("return_no", return_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_return_tax_details 'D',@company_code,'','',@return_no,'','','','','',0,0,'','','','',0,0,'','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    } catch (error) {
      if (error.number === 547) {
        // Foreign key constraint violation
        res.status(400).json("First Delete the Sales Details and Tax Details Data");
        return;
      } else {
        throw error; // Rethrow other SQL errors
      }
    }

    res.status(200).json("Sales return deleted successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getAllsalesdetData = async (req, res) => {
  const { company_code } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(  `EXEC sp_sales_details @mode, @company_code,'','','','','',0,'',0,
        0,0,0,0,'','','','','','',0,'','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const RollMappingDelete = async (req, res) => {
  const keyfieldToDelete = req.body.keyfield;

  try {
    const pool = await connection.connectToDatabase();
    for (const keyfield of keyfieldToDelete) {

      try {
        await pool.request()
          .input("keyfield", keyfield)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(` EXEC sp_user_rolemapping 'D','','','','','',@keyfield,'', @modified_by,null,null,null,null,null,null,null,null
            `);
      } catch (error) {
        if (error.number === 547) {
          // Foreign key constraint violation
          res.status(400).json("First Delete the RoleMapping header");
          return;
        } else {
          throw error; // Rethrow other SQL errors
        }
      }
    }
    res.status(200).json("RoleMapping Deleted Successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const purchaseEditHeader = async (req, res) => {
  const { company_code, transaction_no, Entry_date, pay_type, purchase_type, purchase_amount, total_amount, rounded_off, tax_amount, modified_by } = req.body;
  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("Entry_date", sql.NVarChar, Entry_date)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("purchase_amount", sql.Decimal(14, 2), purchase_amount)
      .input("total_amount", sql.Decimal(10, 2), total_amount)
      .input("rounded_off", sql.Decimal(14, 2), rounded_off)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,@Entry_date, @transaction_no,'',@purchase_type,'','',@pay_type,
          @purchase_amount,@total_amount,0,0,@tax_amount,@rounded_off,0,0,'','','','','','',@modified_by, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const updateRoleMapping = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }
  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("user_code", updatedRow.user_code)
        .input("role_id", updatedRow.role_id)
        .input("keyfield", updatedRow.keyfield)
        .input("created_by", updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_user_rolemapping @mode,@company_code,@user_code,'',@role_id,'',@keyfield,@created_by,@modified_by,@tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getUserRole = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_role_info 'UR',@company_code,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
};




const UpdateUserImage = async (req, res) => {
  const { user_code } = req.body;

  let user_img = null;

  if (req.file) {
    user_img = req.file.buffer; // Buffer containing the uploaded image
  }
  try {
    // Check if the user exists in the database
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("user_code", sql.NVarChar, user_code)
      .input("user_img", sql.VarBinary, user_img)
      .query(`EXEC SP_user_info_hdr 'UI','',@user_code,'','','','','','','','','','','',@user_img,'','',
                    NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'User already exists', error: error.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
};




const getInventoryTransaction = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'InventoryTransacti','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getEmptype = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'EmployeeType','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const updateitemData = async (req, res) => {
  const editedData = req.body.editedData;



  if (!editedData || !editedData.length) {
    res.status(400).json("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of editedData) {
      const item_images =
        updatedRow.item_images && updatedRow.item_images.type === "Buffer"
          ? Buffer.from(updatedRow.item_images.data)
          : null;


      console.log(item_images);
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("Item_code", updatedRow.Item_code)
        .input("Item_variant", updatedRow.Item_variant)
        .input("Item_name", sql.VarChar, updatedRow.Item_name)
        .input("Item_wigh", sql.Decimal(10, 2), updatedRow.Item_wigh)
        .input("Item_BaseUOM", sql.NVarChar, updatedRow.Item_BaseUOM)
        .input("Item_SecondaryUOM", sql.NVarChar, updatedRow.Item_SecondaryUOM)
        .input("Item_short_name", sql.NVarChar, updatedRow.Item_short_name)
        .input("Item_Last_salesRate_ExTax", sql.Decimal(12, 2), updatedRow.Item_Last_salesRate_ExTax)
        .input("Item_Last_salesRate_IncludingTax", sql.Decimal(12, 2), updatedRow.Item_Last_salesRate_IncludingTax)
        .input("Item_std_purch_price", sql.Decimal(12, 2), updatedRow.Item_std_purch_price)
        .input("Item_std_sales_price", sql.Decimal(12, 2), updatedRow.Item_std_sales_price)
        .input("Item_purch_tax_type", sql.VarChar, updatedRow.Item_purch_tax_type)
        .input("Item_sales_tax_type", sql.VarChar, updatedRow.Item_sales_tax_type)
        .input("Item_Costing_Method", sql.VarChar, updatedRow.Item_Costing_Method)
        .input("hsn", sql.VarChar, updatedRow.hsn)
        .input("Item_Register_Brand", sql.VarChar, updatedRow.Item_Register_Brand)
        .input("Item_Our_Brand", sql.VarChar, updatedRow.Item_Our_Brand)
        .input("status", sql.VarChar, updatedRow.status)
        .input("item_images", sql.VarBinary.item_images)
        .input("Item_other_purch_taxtype", sql.VarChar, updatedRow.Item_other_purch_taxtype)
        .input("Item_other_sales_taxtype", sql.VarChar, updatedRow.Item_other_sales_taxtype)
        .input("MRP_Price", sql.Decimal(10, 2), updatedRow.MRP_Price)
        .input("discount_Percentage", sql.Decimal(5, 2), updatedRow.discount_Percentage)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['Modified-By'])
        .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,@Item_variant,@Item_name,@Item_wigh,@Item_BaseUOM,@Item_SecondaryUOM,@Item_short_name,@Item_Last_salesRate_ExTax,@Item_Last_salesRate_IncludingTax,
        @Item_std_purch_price,@Item_std_sales_price,@Item_purch_tax_type,@Item_sales_tax_type,@Item_Costing_Method,@hsn,@Item_Register_Brand,@Item_Our_Brand,@status,@item_images,'',@Item_other_purch_taxtype,
        @Item_other_sales_taxtype,@MRP_price,@discount_Percentage,'',@created_by,@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    }

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




const getCondition = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Condition','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code added by pavun 25/09/2024
const PurchaseAuthHdr = async (req, res) => {
  const { company_code, transaction_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_hdr_test @mode,@company_code,'',@transaction_no,'','','','','',
          0,0,0,0,0,0,0,0,'','',@authroization_status,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
          if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
          } else {
            res.status(404).json("Data not found");
          }
        } catch (err) {
          console.error("Error inserting data:", err);
      
          res.status(500).json({
            message: err.message || "Internal Server Error"
          });
        }
      };
      
      

const PurchaseAuthDetail = async (req, res) => {
  const { company_code, transaction_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_details @mode,@company_code,'',@transaction_no,'','',0,'','',0,0,0,0,0,'','','','','',0,@authroization_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
      if (result.recordset.length > 0) {
        res.status(200).json(result.recordset);
      } else {
        res.status(404).json("Data not found");
      }
    } catch (err) {
      console.error("Error inserting data:", err);
  
      res.status(500).json({
        message: err.message || "Internal Server Error"
      });
    }
  };
  
  


const PurchaseAuthTaxDetail = async (req, res) => {
  const { company_code, transaction_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_tax_details @mode,@company_code,'',@transaction_no,'','',0,0,'','','','',0,0,@authroization_status,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};


const SalesAuthHdr = async (req, res) => {
  const { company_code, bill_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_hdr_test @mode,@company_code,'',@bill_no,'','','',0,0,0,0,0,0,0,0,'','','',
        '',@authroization_status,'','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

        if (result.recordset.length > 0) {
          res.status(200).json(result.recordset); // 200 OK if data is found
        } else {
          res.status(404).json("Data not found"); // 404 Not Found if no data is found
        }
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const SalesAuthDetail = async (req, res) => {
  const { bill_no, authroization_status, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("bill_no", sql.NVarChar, bill_no)
      .input("company_code", sql.NVarChar, company_code)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_details @mode, @company_code,'',@bill_no,'','','',0,'',0,
        0,0,0,0,'','','','','','',0,@authroization_status,'',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const SalesAuthTaxDetail = async (req, res) => {
  const { company_code, bill_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_tax_details @mode,@company_code,'',@bill_no,'','',0,0,'','','','',0,0,@authroization_status,'',''
	,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};

const PurchReturnAuthHdr = async (req, res) => {
  const { company_code, return_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_return_hdr @mode,@company_code,'',@return_no,'','','','','','','',
    '','',0,0,0,0,0,0,0,0,0,@authroization_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const PurchReturnAuthDetail = async (req, res) => {
  const { company_code, return_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_return_details
            @mode,@company_code,'','','',@return_no,'','','','','',0,0,0,0,0,0,0,'','','','','','',0,'',0,0,@authroization_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const PurchReturnAuthTaxDetail = async (req, res) => {
  const { company_code, return_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_purchase_return_tax_details @mode,@company_code,'',@return_no,'','','','','','',0,0,'','','','',0,0,@authroization_status,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
     res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const SalesReturnAuthHdr = async (req, res) => {
  const { company_code, return_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_return_hdr @mode,@company_code,'','','',@return_no,'','','','','',0,0,0,0,0,0,0,'','','','','',0,@authroization_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const SalesReturnAuthDetail = async (req, res) => {
  const { return_no, company_code, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_return_details @mode,@company_code,'','','',@return_no,'','','','','','',0,0,0,0,0,0,0,'','','','','','',0,0,0,@authroization_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
      if (result.recordset.length > 0) {
        res.status(200).json(result.recordset); // 200 OK if data is found
      } else {
        res.status(404).json("Data not found"); // 404 Not Found if no data is found
      }
} catch (err) {
  console.error(err);
  // Send the specific SQL error message if available
  if (err.originalError && err.originalError.message) {
    return res.status(400).json(err.originalError.message);
  } else {
    return res.status(500).json(err.message || "Internal Server Error");
  }
}
};



const SalesReturnAuthTaxDetail = async (req, res) => {
  const { company_code, return_no, authroization_status } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AU")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .input("authroization_status", sql.NVarChar, authroization_status)
      .query(`EXEC sp_sales_return_tax_details @mode,@company_code,'','',@return_no,'','','','','',0,0,'','','','',0,0,@authroization_status,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};


const UpdateItemImage = async (req, res) => {
  const { item_code } = req.body;

  let item_images = null;

  if (req.file) {
    item_images = req.file.buffer;
  }
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, 'IIU')
      .input("item_code", sql.NVarChar, item_code)
      .input("item_images", sql.VarBinary, item_images)
      .query(`EXEC sp_item_brand_info @mode,'',@item_code,'','',0,'','','',0,0,0,
                           0,'','','','','','','',@item_images,'','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Item already exists', error: error.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
};


//code added by pavun 05-06-2024
const LocationUpdate = async (req, res) => {
  const { location_no, location_name, short_name, address1, address2, address3,
    city, state, pincode, country, email_id, status, contact_no, created_by, modified_by
  } = req.body;

  let pool;
  try {
    pool = await connection.connectToDatabase();

    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("location_no", sql.NVarChar, location_no)
      .input("location_name", sql.NVarChar, location_name)
      .input("short_name", sql.NVarChar, short_name)
      .input("address1", sql.NVarChar, address1)
      .input("address2", sql.NVarChar, address2)
      .input("address3", sql.NVarChar, address3)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("email_id", sql.NVarChar, email_id)
      .input("status", sql.NVarChar, status)
      .input("contact_no", sql.NVarChar, contact_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_location_info @mode,@location_no, @location_name, @short_name, @address1, @address2, 
          @address3, @city, @state, @pincode, @country, @email_id,  @status, @contact_no, @created_by, @modified_by , 
         '', '', '', '','', '', '',''`);
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const CompanyUpdate = async (req, res) => {
  const { company_no, company_name, short_name, address1, address2, address3, city, state,
    pincode, country, email_id, status, foundedDate, websiteURL, contact_no,
    annualReportURL, location_no, company_gst_no, modified_by } = req.body;

  let company_logo = req.files['company_logo'] ? req.files['company_logo'][0].buffer : null;
  let authorisedSignatur = req.files['authorisedSignatur'] ? req.files['authorisedSignatur'][0].buffer : null;
  try {
    const pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_no", sql.NVarChar, company_no)
      .input("company_name", sql.NVarChar, company_name)
      .input("short_name", sql.NVarChar, short_name)
      .input("address1", sql.NVarChar, address1)
      .input("address2", sql.NVarChar, address2)
      .input("address3", sql.NVarChar, address3)
      .input("city", sql.NVarChar, city)
      .input("state", sql.NVarChar, state)
      .input("pincode", sql.NVarChar, pincode)
      .input("country", sql.NVarChar, country)
      .input("email_id", sql.NVarChar, email_id)
      .input("status", sql.NVarChar, status)
      .input("foundedDate", sql.NVarChar, foundedDate)
      .input("websiteURL", sql.NVarChar, websiteURL)
      .input("company_logo", sql.VarBinary, company_logo)
      .input("contact_no", sql.NVarChar, contact_no)
      .input("annualReportURL", sql.NVarChar, annualReportURL)
      .input("location_no", sql.NVarChar, location_no)
      .input("company_gst_no", sql.NVarChar, company_gst_no)
      .input("authorisedSignatur", sql.VarBinary, authorisedSignatur)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_company_info @mode, @company_no, @company_name, @short_name, @address1, @address2, @address3, @city, @state, @pincode, @country, @email_id, 
        @status, @foundedDate, @websiteURL, @company_logo , @contact_no, @annualReportURL,@location_no,@company_gst_no,@authorisedSignatur,'' ,@modified_by,
         '', '', '', '','', '', '', ''`);

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const UpdateCompanyImage = async (req, res) => {
  const { company_no } = req.body;

  let company_logo = null;

  if (req.file) {
    company_logo = req.file.buffer;
  }

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_no", sql.NVarChar, company_no)
      .input("company_logo", sql.VarBinary, company_logo)
      .query(`EXEC sp_company_info 'CIU',@company_no,'','','','','','','','','','','','','',@company_logo,'','','','','','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,null`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'company already exists', error: error.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
};

//code added by pavun 07-10-2024
const RoleUpdate = async (req, res) => {
  const { company_code, role_id, role_name, description, created_by, modified_by } = req.body;
  let pool;
  try {
    pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U") // update mode
      .input("company_code", sql.NVarChar, company_code)
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .input("description", sql.NVarChar, description)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(
        `EXEC sp_Role_Info @mode,@company_code,@role_id,@role_name,@description,@created_by,@modified_by,'','',
          '','','','','',''`);

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const UserUpdate = async (req, res) => {
  const { company_code, user_code, user_name, first_name, last_name, user_password, user_status,
    log_in_out, user_type, email_id, dob, gender, role_id, created_by, modified_by
  } = req.body;

  let user_images = null;

  if (req.file) {
    user_images = req.file.buffer;
  }

  try {
    pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U") // update mode
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("user_password", sql.NVarChar, user_password)
      .input("user_status", sql.NVarChar, user_status)
      .input("log_in_out", sql.NVarChar, log_in_out)
      .input("user_type", sql.NVarChar, user_type)
      .input("email_id", sql.NVarChar, email_id)
      .input("dob", sql.NVarChar, dob)
      .input("gender", sql.NVarChar, gender)
      .input("role_id", sql.NVarChar, role_id)
      .input("user_images", sql.VarBinary, user_images)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(
        `EXEC SP_user_info_hdr @mode,@company_code, @user_code, @user_name, @first_name, @last_name, @user_password, @user_status, @log_in_out, @user_type, 
            @email_id, @dob, @gender,@role_id,@user_images, @created_by, @modified_by, '', '', '', '', '', '', '', ''`);
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const CompanyMappingUpdate = async (req, res) => {
  const { company_code, user_code, company_no, location_no, status, order_no, keyfiels, modified_by } = req.body;
  let pool;
  try {
    pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.VarChar, user_code)
      .input("company_no", sql.NVarChar, company_no)
      .input("location_no", sql.VarChar, location_no)
      .input("status", sql.VarChar, status)
      .input("order_no", sql.Int, order_no)
      .input("keyfiels", sql.NVarChar, keyfiels)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_user_company_mapping @mode, @company_code, @user_code, @company_no, @location_no, 
          @status, @order_no,@keyfiels,'',@modified_by,'', '', '', '', '', '', '', ''`);
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const RoleMappingUpdate = async (req, res) => {
  const { company_code, user_code, role_id, keyfield, modified_by } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("user_code", sql.VarChar, user_code)
      .input("role_id", sql.VarChar, role_id)
      .input("keyfield", sql.VarChar, keyfield)
      .input("modified_by", sql.VarChar, modified_by)
      .query(`EXEC sp_user_rolemapping @mode,@company_code,@user_code,'',@role_id,'',@keyfield,'',@modified_by,'','','','','','','',''`);

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const AttributeUpdate = async (req, res) => {
  const { company_code, attributeheader_code, attributedetails_code, attributedetails_name, descriptions, created_by, modified_by } = req.body;

  let pool;
  try {
    pool = await connection.connectToDatabase();

    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("attributedetails_code", sql.NVarChar, attributedetails_code)
      .input("attributedetails_name", sql.NVarChar, attributedetails_name)
      .input("descriptions", sql.NVarChar, descriptions)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(
        `EXEC sp_attribute_Info @mode,@company_code, @attributeheader_code, @attributedetails_code, @attributedetails_name, @descriptions, @created_by,@modified_by, '', '', '', '', '', '', '', ''`
      );
    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const NumberSeriesUpdate = async (req, res) => {
  const { company_code, Screen_Type, Start_Year, End_Year, Start_No, Running_No, End_No, text, number_prefix, Status, created_by, modified_by } = req.body;

  let pool;
  try {
    pool = await connection.connectToDatabase();

    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("Screen_Type", sql.NVarChar, Screen_Type)
      .input("Start_Year", sql.NVarChar, Start_Year)
      .input("End_Year", sql.NVarChar, End_Year)
      .input("Start_No", sql.Int, Start_No)
      .input("Running_No", sql.Int, Running_No)
      .input("End_No", sql.Int, End_No)
      .input("text", sql.NVarChar, text)
      .input("number_prefix", sql.NVarChar, number_prefix)
      .input("Status", sql.NVarChar, Status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_numberseries @mode, @company_code,@Screen_Type, @Start_Year, @End_Year, @Start_No, @Running_No,@End_No,@text,@number_prefix,
             @Status,@created_by,@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,''`);

    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const ItemUpdate = async (req, res) => {
  const { company_code, Item_code, Item_variant, Item_name, Item_wigh, Item_BaseUOM, Item_SecondaryUOM, Item_short_name, Item_Last_salesRate_ExTax,
    Item_Last_salesRate_IncludingTax, Item_std_purch_price, Item_std_sales_price, Item_purch_tax_type,
    Item_sales_tax_type, Item_Costing_Method, hsn, Item_Register_Brand, Item_Our_Brand,
    status, Item_other_purch_taxtype, Item_other_sales_taxtype, MRP_price, discount_Percentage, created_by, modified_by
  } = req.body;

  let item_images = null;

  if (req.file) {
    item_images = req.file.buffer; // Buffer containing the uploaded image
  }

  try {
    pool = await connection.connectToDatabase();

    await pool
      .request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .input("Item_name", sql.VarChar, Item_name)
      .input("Item_wigh", sql.Decimal(10, 2), Item_wigh)
      .input("Item_BaseUOM", sql.NVarChar, Item_BaseUOM)
      .input("Item_SecondaryUOM", sql.NVarChar, Item_SecondaryUOM)
      .input("Item_short_name", sql.NVarChar, Item_short_name)
      .input("Item_Last_salesRate_ExTax", sql.Decimal(12, 2), Item_Last_salesRate_ExTax)
      .input("Item_Last_salesRate_IncludingTax", sql.Decimal(12, 2), Item_Last_salesRate_IncludingTax)
      .input("Item_std_purch_price", sql.Decimal(12, 2), Item_std_purch_price)
      .input("Item_std_sales_price", sql.Decimal(12, 2), Item_std_sales_price)
      .input("Item_purch_tax_type", sql.VarChar, Item_purch_tax_type)
      .input("Item_sales_tax_type", sql.VarChar, Item_sales_tax_type)
      .input("Item_Costing_Method", sql.VarChar, Item_Costing_Method)
      .input("hsn", sql.VarChar, hsn)
      .input("Item_Register_Brand", sql.VarChar, Item_Register_Brand)
      .input("Item_Our_Brand", sql.VarChar, Item_Our_Brand)
      .input("status", sql.VarChar, status)
      .input("item_images", sql.VarBinary, item_images)
      .input("Item_other_purch_taxtype", sql.VarChar, Item_other_purch_taxtype)
      .input("Item_other_sales_taxtype", sql.VarChar, Item_other_sales_taxtype)
      .input("MRP_price", sql.Decimal(10, 2), MRP_price)
      .input("discount_Percentage", sql.Decimal(5, 2), discount_Percentage)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,@Item_variant,@Item_name,@Item_wigh,@Item_BaseUOM,@Item_SecondaryUOM,@Item_short_name,@Item_Last_salesRate_ExTax,@Item_Last_salesRate_IncludingTax,
        @Item_std_purch_price,@Item_std_sales_price,@Item_purch_tax_type,@Item_sales_tax_type,@Item_Costing_Method,@hsn,@Item_Register_Brand,@Item_Our_Brand,@status,@item_images,'',@Item_other_purch_taxtype,
        @Item_other_sales_taxtype,@MRP_price,@discount_Percentage,'',@created_by,@modified_by,NULL,NULL,NULL,NULL
						   ,NULL,NULL,NULL,NULL`);


    res.status(200).json("Edited data saved successfully");
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: error.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
};

const TaxUpdate = async (req, res) => {
  const { company_code, tax_type_header, tax_name_details, tax_accountcode, tax_percentage, tax_shortname, transaction_type, status, created_by, modified_by } = req.body;

  let pool;
  try {
    pool = await connection.connectToDatabase();

    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("company_code", sql.VarChar, company_code)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_accountcode", sql.NVarChar, tax_accountcode)
      .input("tax_percentage", sql.Decimal(14, 2), tax_percentage)
      .input("tax_shortname", sql.NVarChar, tax_shortname)
      .input("transaction_type", sql.NVarChar, transaction_type)
      .input("status", sql.NVarChar, status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(
        `EXEC sp_tax_name_details @mode,@company_code,@tax_type_header, @tax_name_details, @tax_percentage, @tax_shortname, @tax_accountcode,
               @transaction_type, @status,@created_by,@modified_by, '', '', '', '', '', '','', ''`);

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const WarehouseUpdate = async (req, res) => {
  const { company_code, warehouse_code, warehouse_name, status, location_no, created_by, modified_by } = req.body;

  let pool;

  try {
    pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode", sql.NVarChar, "U") // update mode
      .input("company_code", sql.NVarChar, company_code)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("warehouse_name", sql.NVarChar, warehouse_name)
      .input("status", sql.NVarChar, status)
      .input("location_no", sql.NVarChar, location_no)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(
        `EXEC sp_warehouse_info @mode ,@company_code, @warehouse_code, @warehouse_name, @status, @location_no, 
                 @created_by,@modified_by, '', '', '', '','', '', '', ''` );
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const VendorUpdate = async (req, res) => {
  const { vendor_code, company_code, vendor_addr_1, vendor_addr_2, vendor_addr_3, vendor_addr_4,
    vendor_area_code, vendor_state_code, vendor_country_code, vendor_office_no, vendor_resi_no, vendor_mobile_no,
    vendor_email_id, vendor_salesman_code,
    contact_person, office_type, keyfield, modified_by } = req.body;
  let pool;
  try {
    pool = await connection.connectToDatabase();
    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_addr_1", sql.NVarChar, vendor_addr_1)
      .input("vendor_addr_2", sql.NVarChar, vendor_addr_2)
      .input("vendor_addr_3", sql.NVarChar, vendor_addr_3)
      .input("vendor_addr_4", sql.NVarChar, vendor_addr_4)
      .input("vendor_area_code", sql.NVarChar, vendor_area_code)
      .input("vendor_state_code", sql.NVarChar, vendor_state_code)
      .input("vendor_country_code", sql.NVarChar, vendor_country_code)
      .input("vendor_office_no", sql.NVarChar, vendor_office_no)
      .input("vendor_resi_no", sql.NVarChar, vendor_resi_no)
      .input("vendor_mobile_no", sql.NVarChar, vendor_mobile_no)
      .input("vendor_email_id", sql.NVarChar, vendor_email_id)
      .input("vendor_salesman_code", sql.NVarChar, vendor_salesman_code)
      .input("contact_person", sql.NVarChar, contact_person)
      .input("office_type", sql.NVarChar, office_type)
      .input("keyfield", sql.NVarChar, keyfield)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,'','','','',@vendor_addr_1,@vendor_addr_2,@vendor_addr_3,
        @vendor_addr_4,@vendor_area_code,@vendor_state_code,@vendor_country_code,@vendor_office_no,@vendor_resi_no,@vendor_mobile_no,@vendor_email_id,
        @vendor_salesman_code,@contact_person,@office_type,@keyfield,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//ced ended by pavun



//code added by pavun 08-10-2024
const CustomerUpdate = async (req, res) => {
  const { customer_code, company_code, customer_addr_1, customer_addr_2, customer_addr_3,
    customer_addr_4, customer_area, customer_state, customer_country, customer_office_no, customer_resi_no,
    customer_mobile_no, customer_email_id, customer_credit_limit, customer_salesman_code, contact_person, office_type, default_customer, keyfield, modified_by
  } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("customer_code", sql.VarChar, customer_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_addr_1", sql.VarChar, customer_addr_1)
      .input("customer_addr_2", sql.VarChar, customer_addr_2)
      .input("customer_addr_3", sql.VarChar, customer_addr_3)
      .input("customer_addr_4", sql.VarChar, customer_addr_4)
      .input("customer_area", sql.VarChar, customer_area)
      .input("customer_state", sql.VarChar, customer_state)
      .input("customer_country", sql.VarChar, customer_country)
      .input("customer_office_no", sql.NVarChar, customer_office_no)
      .input("customer_resi_no", sql.NVarChar, customer_resi_no)
      .input("customer_mobile_no", sql.NVarChar, customer_mobile_no)
      .input("customer_email_id", sql.NVarChar, customer_email_id)
      .input("customer_credit_limit", sql.Decimal(14, 3), customer_credit_limit)
      .input("customer_salesman_code", sql.NVarChar, customer_salesman_code)
      .input("contact_person", sql.NVarChar, contact_person)
      .input("office_type", sql.NVarChar, office_type)
      .input("default_customer", sql.NVarChar, default_customer)
      .input("keyfield", sql.NVarChar, keyfield)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_customer_details_info @mode,@customer_code,@company_code,'', '', '', '', @customer_addr_1, @customer_addr_2, @customer_addr_3, @customer_addr_4,@customer_area,
        @customer_state, @customer_country, @customer_office_no, @customer_resi_no, @customer_mobile_no,@customer_email_id, 
         @customer_credit_limit,@customer_salesman_code,@contact_person,@office_type,@default_customer,@keyfield,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    res.status(200).json("Updated data successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




//Code added By Harish 18-10-2024
const getEvent = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Transactions Event','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//Code Ended By Harish 18-10-2024

//code added by Kathir 19-10-2024

const purauthstatus = async (req, res) => {
  const { company_code, transaction_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .query(`EXEC sp_purcahse_hdr_test @mode,@company_code,'',@transaction_no,'','','','','',
          0,0,0,0,0,0,0,0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Check if any records were returned
    if (result.recordset.length === 0) {
      return res.status(404).json("Transaction not found.");
    }

    // If the transaction exists, return a success response
    return res.status(200).json(result.recordset);

  } catch (err) {
    console.error(err);
    // Send the specific SQL error message if available
    if (err.originalError && err.originalError.message) {
      return res.status(400).json(err.originalError.message);
    } else {
      return res.status(500).json({
        message: err.message || "Internal Server Error"
      });
    }
  }
};

const salauthstatus = async (req, res) => {
  const { company_code, bill_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_no", sql.NVarChar, bill_no)
      .query(`EXEC sp_sales_hdr_test @mode,@company_code,'',@bill_no,'','','',0,0,0,0,0,0,0,0,'','','',
        '','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

        if (result.recordset.length > 0) {
          res.status(200).json(result.recordset); // 200 OK if data is found
        } else {
          res.status(404).json("Data not found"); // 404 Not Found if no data is found
        }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const salretauthstatus = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .query(`EXEC sp_sales_return_hdr @mode,@company_code,'','','',@return_no,'','','','','',0,0,0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

 
      res.json(result.recordset);
    } catch (err) {
      console.error("Error", err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  };

const purretauthstatus = async (req, res) => {
  const { company_code, return_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TS")
      .input("company_code", sql.NVarChar, company_code)
      .input("return_no", sql.NVarChar, return_no)
      .query(`EXEC sp_purchase_return_hdr @mode,@company_code,'',@return_no,'','','','','','','',
    '','',0,0,0,0,0,0,0,0,0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

   
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    // Send the specific SQL error message if available
    if (err.originalError && err.originalError.message) {
      return res.status(400).json(err.originalError.message);
    } else {
      return res.status(500).json(err.message || "Internal Server Error");
    }
  }
};


const getPurItemAmountCalculation = async (req, res) => {
  const { Item_SNO, Item_code, bill_qty, purchaser_amt, tax_type_header, tax_name_details, tax_percentage, UnitWeight, keyfield } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IAC")
      .input("Item_SNO", sql.BigInt, Item_SNO)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("purchaser_amt", sql.Decimal(10, 2), purchaser_amt)
      .input("tax_type_header", sql.NVarChar, tax_type_header)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_percentage", sql.NVarChar, tax_percentage)
      .input("UnitWeight", sql.Decimal(8, 3), UnitWeight)
      .input("keyfield", sql.NVarChar, keyfield)
      .query(`EXEC sp_ItemAmountCalculation @mode,'' , @Item_SNO ,@Item_code, @bill_qty, @purchaser_amt	,@tax_type_header, @tax_name_details, @tax_percentage, @UnitWeight, @keyfield,
                                NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};






const getsiblings = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Siblings','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getkids = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Kids','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getMartial = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Marital Status','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getSalaryType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Salary Type','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPayscale = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Payscale','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};






const getLoanID = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'LoanID','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





//Code added By Harish  18_11_2024
const getItem = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'product','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//Code Ended By Harish  18_11_2024



const getDocumentType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'document type','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




//Code Added by Pavun 30/11/2024
const getCustomerDetails = async (req, res) => {
  const { company_code, customer_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TC")
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .query(`EXEC sp_customer_details_info @mode,@customer_code,@company_code,'','','','','','','','','','','','','','','',0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code ended  by pavun 30/11/2024




//Code Added by Harish 03/12/2024


const getrelation = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Relationship','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//Code Ended by Harish 03/12/2024



const getCurrentStockDetails = async (req, res) => {
  const { company_code, item_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CSD")
      .input("company_code", sql.NVarChar, company_code)
      .input("item_code", sql.NVarChar, item_code)
      .query(
        `EXEC sp_dashboard_stock @mode,@company_code,@item_code `
      );
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getCurrentStockItemCode = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CSI")
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_dashboard_stock @mode,@company_code,'' `
      );
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addOpeningBalanceItemHdr = async (req, res) => {
  const { company_code, transaction_no, transaction_date, created_by, modified_by } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.Date, transaction_date)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_opening_item_hdr @mode,@company_code,@transaction_no,@transaction_date,@created_by,@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}


const getTotalStockValueDetails = async (req, res) => {
  const { company_code, item_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "TSVD")
      .input("company_code", sql.NVarChar, company_code)
      .input("item_code", sql.NVarChar, item_code)
      .query(
        `EXEC sp_dashboard_stock @mode,@company_code,@item_code`
      );
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else {
      // Send a 404 Not Found status if no data is found
      res.status(404).json('No data found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const openingitemhdr = async (req, res) => {
  const { company_code, transaction_no, transaction_date, created_by,
    tempstr1, tempstr2, tempstr3, tempstr4, datetime1, datetime2, datetime3, datetime4,

  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.Date, transaction_date)
      .input("created_by", sql.NVarChar, created_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC [sp_opening_item_hdr] @mode,@company_code,@transaction_no,@transaction_date ,
        @created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`)

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Added Successfully");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const openingitemdelhdr = async (req, res) => {

  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    await pool.request()
      .input("company_code", company_code)
      .input("transaction_no", transaction_no)

      .query(`EXEC [sp_opening_item_hdr] 'd',@company_code,@transaction_no,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Opening Balance Header deleted successfully");
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getallOIHdr = async (req, res) => {

  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", company_code)
      .query
      (`EXEC [sp_opening_item_hdr] 'A',@company_code,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Not Found");
    }
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code added by pavun 13-12-2024
const addOpeningItemDetail = async (req, res) => {
  const { company_code, transaction_no, transaction_date, Item_code, Item_name, bill_qty, Item_SNo, created_by } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.Date, transaction_date)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_name", sql.NVarChar, Item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("Item_SNo", sql.BigInt, Item_SNo)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_opening_item_details @mode,@transaction_no,@company_code,@transaction_date,@Item_code,@Item_name,@bill_qty,@Item_SNo,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`)

    res.status(200).json("Data Inserted Successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const deleteOpeningItemDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    await pool.request()
      .input("mode", sql.NVarChar, "D")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .query(`EXEC sp_opening_item_details @mode,@transaction_no,@company_code,'','','',0,0,'',''
          ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Data Deleted Successfully");
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const allOpeningItemDetail = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_opening_item_details @mode,'',@company_code,'','','',0,0,'',''
          ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Not Found");
    }
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getallOpeningItem = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "OI")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      const data = {
        Header: result.recordsets[0],
        Details: result.recordsets[1]
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const openingItemSearch = async (req, res) => {
  const { company_code, transaction_date, transaction_no, Item_code, Item_name } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_name", sql.NVarChar, Item_name)
      .query(`EXEC sp_opening_item_details @mode,@transaction_no,@company_code,@transaction_date,@Item_code,@Item_name,0,0,'',''
          ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Not Found");
    }
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getallOpeningItemDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "OID")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};







// code Ended By madhu 14/12/24





const getcompanyshift = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'ESS_SHIFT','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




// Code Added by Harish on 20/12/24


const getItemCodeSalesDataQuote = async (req, res) => {
  const { company_code, Item_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIICQ")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','',
            '','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


// Code Added By Harish 23/12/24

const getotherpurtax = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC [sp_tax_name_hdr] 'OPT',@company_code,'','',0,'','','','','','','','',null,null,null,null,null,null,null,null"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getothersalestax = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC [sp_tax_name_hdr] 'OST',@company_code,'','',0,'','','','','','','','',null,null,null,null,null,null,null,null"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getOverallTAX = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'tax type','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getItemCodeOtherSalesData = async (req, res) => {
  const { company_code, Item_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIICO")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,@Item_code,'','',0,'','','',0,0,0,0,'','','','','','','','',
            '','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getInvocieType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Invoice Type','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





//Code Ended by Harish 25/12/24

//code added by pavun 25-12-2024
const getVendorDetails = async (req, res) => {
  const { company_code, vendor_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PV")
      .input("company_code", sql.NVarChar, company_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .query(`EXEC sp_vendor_details_info_hdr @mode,@vendor_code,@company_code,'','','','','','','','','','','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//CODE ADDED BY PAVUN 26-12-2024

const getItemCodeSalesDatatest = async (req, res) => {
  const { company_code, code, sales_type } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIIC")
      .input("company_code", sql.NVarChar, company_code)
      .input("code", sql.NVarChar, code)
      .input("sales_type", sql.NVarChar, sales_type)
      .query(`EXEC sp_tax_type_item_data @mode,@company_code,@sales_type,@code,'','','','','',''`);
    // Send response
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getCodeSalesDatatest = async (req, res) => {
  const { company_code, code, sales_type, filter } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STIC")
      .input("company_code", sql.NVarChar, company_code)
      .input("code", sql.NVarChar, code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("filter", sql.NVarChar, filter)
      .query(`EXEC sp_tax_type_item_data @mode,@company_code,@sales_type,@code,'','','','','',@filter`);
    // Send response
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getcodetest = async (req, res) => {
  const { company_code, code, filter } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "FC")
      .input("company_code", sql.NVarChar, company_code)
      .input("code", sql.NVarChar, code)
      .input("filter", sql.NVarChar, filter)
      .query(`EXEC sp_tax_type_item_data @mode,@company_code,'',@code,'','','','','',@filter`);
    // Send response
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset);  // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getitemsalsearchdatatest = async (req, res) => {
  const { company_code, sales_type, Item_code, Item_name, Item_variant, Item_short_name, Item_Our_Brand, status } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "STI")
      .input("company_code", sql.NVarChar, company_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("code", sql.NVarChar, Item_code)
      .input("name", sql.NVarChar, Item_name)
      .input("variant", sql.NVarChar, Item_variant)
      .input("short_name", sql.NVarChar, Item_short_name)
      .input("Our_Brand", sql.NVarChar, Item_Our_Brand)
      .input("status", sql.NVarChar, status)
      .query(`EXEC sp_tax_type_item_data @mode,@company_code,@sales_type,@code,@name,@variant,@short_name,@Our_Brand,@status,''`);
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};









const getLeaveType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'LeaveType','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSelectSlot = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Select_Slot','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getGstReportAnalysis = async (req, res) => {
  const { Mode, Party, StartDate, EndDate, company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("Mode", sql.NVarChar, Mode) // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("Party", sql.NVarChar, Party)
      .input("StartDate", sql.Date, StartDate)
      .input("EndDate", sql.Date, EndDate)
      .query(`EXEC sp_gst_report @Mode,@company_code,@Party,@StartDate,@EndDate,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else res.status(404).json({ message: "Data not found" })
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });

  }
};

const getDashBoardType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Sales','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getGST = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'GST','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPartyName = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'PartyName','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getGSTReport = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'GF',@company_code,'GSTReport','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getItemCode = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "OI")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,'','','',0,'','','',0,0,0,0,'','','','','','','','',
            '','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getOpeningItemPeriod = async (req, res) => {
  const { company_code, Item_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "OIA")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .query(`EXEC sp_opening_item_details @mode,'',@company_code,'',@Item_code,'',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Not Found");
    }
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getType = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Type','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAccrual = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'AccrualType','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getExceedLeave = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Exceed_Leave','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const getLeaveReason = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Leave_Reason','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDateWiseItemStock = async (req, res) => {
  const { item_code, month, company_code, item_variant } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("item_code", sql.NVarChar, item_code) // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("month", sql.NVarChar, month)
      .input("item_variant", sql.NVarChar, item_variant)
      .query(`EXEC sp_datewise_item_stock @company_code,@month,@item_code,@item_variant`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else res.status(404).json({ message: "Data not found" })
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




const getCustomerCodeDrop = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CD")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_customer_info_hdr @mode,@company_code,'','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data Not Found");
    }
  }
  catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





//code added by pavun 10/01/25
const getPendingStatus = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'PendingStatus','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//code ended by pavun



const getdefCustomer = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'DefaultCust','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};



const getitemcodevariant = async (req, res) => {
  const { Item_code, Item_variant, company_code } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DIV")
      .input("Item_code", sql.NVarChar, Item_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info 'D',@company_code,@Item_code,@Item_variant,'',0,'','','',0,0,0,0,'','','','','','','','',
            '','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else res.status(404).json({ message: "Data not found" })
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDefaultoptions = async (req, res) => {
  const { company_code, Screen_Type } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .input("Screen_Type", sql.NVarChar, Screen_Type)
      .query(`EXEC sp_transaction_settings_TEST @mode,@company_code,'','','','','','',@Screen_Type,'','','','',0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL

`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
    else res.status(404).json({ message: "Data not found" })
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


// Code Ended by Harish  22/01/2025


//CODE ADDED BY PAVUN 22-01-2025
const getSalesMode = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'SalesMode','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSalesReturnAmountCalculation = async (req, res) => {
  const { sale_amt, paid_amt } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "RAC")
      .input("sale_amt", sql.VarChar, sale_amt)
      .input("paid_amt", sql.Decimal(14, 2), paid_amt)
      .query(`EXEC [sp_sale_ItemAmountCalculation] @mode,'',0 ,'',0,0,'','','',0,'',0,@sale_amt,0,@paid_amt,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
//CODE ENDED BY PAVUN



// Code Added by Harish 29-01-2025

const AddTransactionSettinngs = async (req, res) => {
  const {
    company_code,
    Party_code,
    Party_name,
    pay_type,
    Transaction_type,
    order_type,
    warehouse_code,
    Screen_Type,
    Sales_mode,
    No_of_Reports,
    Negative_stock,
    Print_options,
    Print_copies,
    Print_templates,
    created_by,
    modified_by
  } = req.body;
  let pool;

  try {
    pool = await sql.connect(dbConfig);
      await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.VarChar, company_code)
      .input("Party_code", sql.VarChar, Party_code)
      .input("Party_name", sql.VarChar, Party_name)
      .input("pay_type", sql.VarChar, pay_type)
      .input("Transaction_type", sql.VarChar, Transaction_type)
      .input("order_type", sql.VarChar, order_type)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("Screen_Type", sql.NVarChar, Screen_Type)
      .input("Sales_mode", sql.NVarChar, Sales_mode)
      .input("No_of_Reports", sql.VarChar, No_of_Reports)
      .input("Negative_stock", sql.VarChar, Negative_stock	)
      .input("Print_options", sql.VarChar, Print_options)
      .input("Print_copies", sql.Int, Print_copies)
      .input("Print_templates", sql.VarChar, Print_templates)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`EXEC sp_transaction_settings_TEST @mode,@company_code,@Party_code,@Party_name,@pay_type,@Transaction_type,@order_type,@warehouse_code,@Screen_Type,@Sales_mode,@No_of_Reports,@Negative_stock,@Print_options,@Print_copies,@Print_templates,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ message: "Data inserted successfully" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Code Ended by harish 29-01-2025

//Code Added by pavun 30-01-2025
const getPurchaseAnalysis = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Purchase','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};




//code ended by pavun
// Code Added by Harish 03-02-2025

const getTaskstatus = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Taskstatus','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}



// Code Ended by Harish 03-02-2025


//Code added by pavun 05-02-2025

const PendingCustomer = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'PendingCustomer','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//Code ended by pavun






// Code Added By harish 07-02-25
const getPriority = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'PriorityLevel','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
// Code Ended By harish 07-02-25



const Userdropdown = async (req, res) => {
  const { user_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "MG")
      .input("user_code", sql.NVarChar, user_code)
      .query(`EXEC [SP_user_info_hdr] @mode,'',@user_code,'','','','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};





const getDocument = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query("EXEC sp_attribute_Info 'F',@company_code,'DocumentType','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const updateRoleRights = async (req, res) => {
  const { company_code,role_id,screen_type,permission_type,keyfield,modified_by } = req.body;

  try {
    const pool = await connection.connectToDatabase();
      await pool
        .request()
        .input("mode",              sql.NVarChar, "U")
        .input("company_code",      sql.VarChar,company_code)
        .input("role_id",           sql.VarChar,role_id)
        .input("screen_type",       sql.NVarChar,screen_type)
        .input("permission_type",   sql.VarChar,permission_type)
        .input("keyfield",          sql.VarChar,keyfield)
        .input("modified_by",       sql.NVarChar,modified_by)
        .query(`EXEC sp_rolescreen_mapping @mode,@company_code, @role_id, @screen_type, @permission_type, @keyfield,'', @modified_by,  
               NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`)
    res.status(200).json("Edited data saved successfully");
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//code ended by pavun on 25-04-25
//Code Added By Harish on 01-05-25
const getnegstock = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Negative_Stock','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const getPrint = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Print_options','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
const getcopies = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Print_copies','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Code Added By Harish on 02/05/25
const AddPrintTemplate = async (req, res) => {
 
  const employeeData = req.body.employeeData;

  if (!employeeData || !employeeData.length) {
    res.status(400).json("Invalid or empty employeeId array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);
    for (const insertRow of employeeData) {
      let Templates = insertRow.Templates || null;
      if (Templates) {
        const buffer = Buffer.from(Templates, 'base64');
        insertRow.Templates = buffer; 
      }
    
      await pool
        .request()
        .input("mode", sql.NVarChar, "I")
        .input("Templates", insertRow.Templates)
        .input("Screens", insertRow.Screens)
        .input("Template_name", insertRow.Template_name)
        .input("created_by", insertRow.created_by)
        .input("modified_by", insertRow.modified_by)
        .query(
          `EXEC sp_Print_templates @mode, @Templates, 0, @Screens, @Template_name, '', @created_by, '', null, null, null, null, null, null, null, null`
        );
      }
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
// Code Ended By Harish on 02/05/25

//CODE ADDED BY PAVUN ON 05-05-2025

const salesTermsandCondition = async (req, res) => {
  const { bill_no,company_code,Terms_conditions,created_by} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("mode",              sql.NVarChar, "I") // Insert mode
      .input("company_code",      sql.VarChar, company_code)
      .input("bill_no",           sql.NVarChar, bill_no)
      .input("Terms_conditions",  sql.VarChar, Terms_conditions)
      .input("created_by",        sql.NVarChar, created_by)
      .query(`EXEC sp_Terms_conditions_Sales @mode,@company_code,@bill_no,@Terms_conditions,@created_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Data Inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const deleteSalesTermsandCondition = async (req, res) => {
  const { bill_no, company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    await pool
      .request()
      .input("mode",            sql.NVarChar, "D")
      .input("company_code",    sql.NVarChar, company_code)
      .input("bill_no",         sql.NVarChar, bill_no)
      .query(`EXEC sp_Terms_conditions_Sales @mode,@company_code,@bill_no,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("data deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const getAllSalesTermsandCondition = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_Terms_conditions_Sales 'A','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const termsandCondition = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_attribute_Info 'F',@company_code,'Terms&Conditions','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getTermsandConditionSales = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode",               sql.NVarChar, "STC")
      .input("transaction_no",     sql.NVarChar, transaction_no)
      .input("company_code",       sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDeletedTermsSales = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DSTC")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//CODE ENDED BY PAVUN ON 05-05-2025
// Code Added by Harish ON 06-06-2025
const Templatesearch = async (req, res) => {
  const { Screens,Template_name } = req.body;
  try {
    const pool = await connection.connectToDatabase(dbConfig);
    const result = await pool
      .request()
      .input("mode",           sql.NVarChar, "SC")
      .input("Screens",        sql.NVarChar, Screens)
      .input("Template_name",  sql.NVarChar, Template_name)
      .query(`EXEC sp_Print_templates @mode,'',0,@Screens,@Template_name,'','','',null,null,null,null,null,null,null,null`)
    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


//CODE ADDED BY PAVUN ON 06-05-2025
const customerCodeDropdown = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode",          sql.NVarChar, "CC")
      .input("company_code",  sql.NVarChar, company_code)
      .query(`EXEC sp_customer_details_info @mode,'',@company_code,'','','','','','','','','','','','','','','',0,'','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
//CODE ENDED BY PAVUN ON 06-05-25

// Code Added By Harish on 13/05/25
const PrintTemplates = async (req, res) => {
  const { Screen_Type } = req.body;
  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode",          sql.NVarChar, "PT")
      .input("Screen_Type",   sql.NVarChar, Screen_Type)
      .query(`EXEC sp_transaction_settings_test @mode,'','','','','','','',@Screen_Type,'','','','',0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
// Code Ended By Harish on 13/05/25

//code added by pavun on 13-05-2025

const vendorCodeDropdown = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode",          sql.NVarChar, "VC")
      .input("company_code",  sql.NVarChar, company_code)
      .query(`EXEC sp_vendor_details_info_hdr @mode,'',@company_code,'','','','','','','','','','','','','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset && result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code ended by pavun on 13-05-25

//code added by pavun on 16-05-25

const getSalesItemCode = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SI")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info @mode,@company_code,'','','',0,'','','',0,0,0,0,'','','','','','','','',
            '','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code ended by pavun on 16-05-25

//code added by pavun on 10-06-25
const addSalesOrderHdr = async (req, res) => {
  const {company_code, bill_date, bill_no, warehouse_code, sales_type, customer_code, sale_amt, net_amt, roff_amt, othr_amt, bill_amt, tax_amount, total_item, pay_type,  sman_code,
    payment_mode, customer_name, order_type, 
    sales_mode, paid_amount, return_amount, created_by} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("sale_amt", sql.Decimal(14,2), sale_amt)
      .input("net_amt", sql.Decimal(14,2), net_amt)
      .input("roff_amt", sql.Decimal(14,2), roff_amt)
      .input("othr_amt", sql.Decimal(14,2), othr_amt)
      .input("bill_amt", sql.Decimal(14,2), bill_amt)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("total_item", sql.Int, total_item)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("payment_mode", sql.NVarChar, payment_mode)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("sales_mode", sql.VarChar, sales_mode)
      .input("paid_amount", sql.Decimal(14, 2), paid_amount)
      .input("return_amount", sql.Decimal(14, 2), return_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_order_hdr @mode,@company_code,@bill_date,@bill_no,@warehouse_code,@sales_type,@customer_code,@sale_amt,@net_amt,@roff_amt,@othr_amt,@bill_amt,@tax_amount,@total_item,@pay_type,@sman_code,@payment_mode,@customer_name,
        @order_type,'','',@sales_mode,@paid_amount,@return_amount,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSalesOrderHdr = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(  `EXEC sp_sales_order_hdr @mode,@company_code,'','','','','',0,0,0,0,0,0,0,0,'','','',
        '','','','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const salesOrderSearchData = async (req, res) => {
  const { company_code, bill_date, bill_no, warehouse_code, sales_type, customer_code, customer_name, sale_amt, bill_amt, pay_type, order_type } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.NVarChar, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("sale_amt", sql.Decimal(14, 2), sale_amt)
      .input("bill_amt", sql.Decimal(14, 2), bill_amt)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("order_type", sql.NVarChar, order_type)
      .query(`EXEC sp_sales_order_hdr @mode,@company_code,@bill_date,@bill_no,@warehouse_code,@sales_type,@customer_code,@sale_amt,0,0,0,@bill_amt,0,0,@pay_type,'','',@customer_name,
        @order_type,'','','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deleteSalesOrderHdr = async (req, res) => {
  const { company_code, bill_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("company_code", company_code)
        .input("bill_no", bill_no)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_order_hdr 'D',@company_code,'',@bill_no,'','','',0,0,0,0,0,0,0,0,'','','',
        '','','','',0,0,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Sales deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const deletedSalesOrderSearchData = async (req, res) => {
  const { company_code, bill_date, bill_no, sales_type, customer_code, customer_name, pay_type, order_type } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SCD")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.NVarChar, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("order_type", sql.NVarChar, order_type)
      .query(`EXEC sp_sales_order_hdr @mode,@company_code,@bill_date,@bill_no,'',@sales_type,@customer_code,
              0,0,0,0,0,0,0,@pay_type,'','',@customer_name,@order_type,'','','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset && Array.isArray(result.recordset) && result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};

const addSalesOrderDetail = async (req, res) => {
  const {company_code,bill_date,bill_no,warehouse_code,customer_code,item_code,ItemSNo,item_name,
    bill_qty,bill_rate,item_amt,weight,total_weight,pay_type,sales_type,sman_code,customer_name,
    order_type,hsn,tax_amt,discount,discount_amount,created_by,} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") 
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("item_code", sql.NVarChar, item_code)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("discount", sql.Decimal(5, 2), discount)
      .input("discount_amount", sql.Decimal(14, 2), discount_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_order_details @mode, @company_code,@bill_date,@bill_no,@warehouse_code,@customer_code,@item_code,@ItemSNo,@item_name,@bill_qty,
        @bill_rate,@item_amt,@weight,@total_weight,@pay_type,@sales_type,@sman_code,@customer_name,@order_type,@hsn,@tax_amt,'','',@discount,@discount_amount,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const deleteSalesOrderDetail = async (req, res) => {
  const { bill_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("mode", sql.NVarChar, "D")
        .input("bill_no", bill_no)
        .input("company_code", company_code)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .query(`EXEC sp_sales_order_details @mode,@company_code,'',@bill_no,'','','',0,'',0,
        0,0,0,0,'','','','','','',0,'','',0,0,'',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Sales Deleted Successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const getSalesOrderDetail = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(  `EXEC sp_sales_order_details @mode, @company_code,'','','','','',0,'',0,
        0,0,0,0,'','','','','','',0,'','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addSalesOrderTaxDet = async (req, res) => {
  const {company_code, bill_date, bill_no, customer_code, pay_type, ItemSNo, TaxSNo, item_code, item_name, tax_type, tax_name_details, tax_amt, tax_per,
    created_by} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("tax_per", sql.Decimal(14, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_order_tax_details @mode,@company_code,@bill_date,@bill_no,@customer_code,@pay_type,@ItemSNo,@TaxSNo,@item_code,@item_name,@tax_type,@tax_name_details,
      @tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const deleteSalesOrderTaxDet = async (req, res) => {
  const { company_code, bill_no } = req.body;
  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("company_code", company_code)
        .input("bill_no", bill_no)
        .query(`EXEC sp_sales_order_tax_details 'D',@company_code,'',@bill_no,'','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("Sales deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const getSalesOrderTaxDet = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_sales_order_tax_details @mode,@company_code,'','','','',0,0,'','','','',0,0,'','',''
	,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addPurchaseOrderHdr = async (req, res) => {
  const { company_code, Entry_date, transaction_no, transaction_date, purchase_type, purchase_amount,total_amount, vendor_code, vendor_name, pay_type, add_fright, less_fright, tax_amount, rounded_off,cartage_paid, other_charges, status, deletePermission, created_by} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code",      sql.NVarChar, company_code)
      .input("Entry_date",        sql.Date, Entry_date)
      .input("transaction_no",    sql.NVarChar, transaction_no)
      .input("transaction_date",  sql.Date, transaction_date)
      .input("purchase_type",     sql.NVarChar, purchase_type)
      .input("vendor_code",       sql.NVarChar, vendor_code)
      .input("vendor_name",       sql.NVarChar, vendor_name)
      .input("pay_type",          sql.NVarChar, pay_type)
      .input("purchase_amount",   sql.Decimal(14, 2), purchase_amount)
      .input("total_amount",      sql.Decimal(10, 2), total_amount)
      .input("add_fright",        sql.Decimal(14, 2), add_fright)
      .input("less_fright",       sql.Decimal(14, 2), less_fright)
      .input("tax_amount",        sql.Decimal(14, 2), tax_amount)
      .input("rounded_off",       sql.Decimal(14, 2), rounded_off)
      .input("cartage_paid",      sql.Decimal(14, 2), cartage_paid)
      .input("other_charges",     sql.Decimal(14, 2), other_charges)
      .input("status",            sql.NVarChar, status)
      .input("deletePermission",  sql.NVarChar, deletePermission)
      .input("created_by",        sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_order_hdr @mode,@company_code,@Entry_date, @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
      @purchase_amount,@total_amount,@add_fright,@less_fright,@tax_amount,@rounded_off, @cartage_paid,@other_charges,@status,@deletePermission,
      '','',@created_by,'', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json(err.message);
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deletePurchaseOrderHdr = async (req, res) => {
  const { company_code, transaction_no, modified_by } = req.body;

  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("company_code", company_code)
        .input("transaction_no", transaction_no)
        .input("modified_by", modified_by)
        .query(`EXEC sp_purchase_order_hdr 'D',@company_code,'',@transaction_no,'','','','','',
          0,0,0,0,0,0,0,0,'','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const PurchaseOrderSearchData = async (req, res) => {
  const { company_code, transaction_no, transaction_date, vendor_code, vendor_name, purchase_type, pay_type } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("pay_type", sql.NVarChar, pay_type)
      .query(`EXEC sp_purchase_order_hdr @mode,@company_code,'', @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
          0,0,0,0,0,0,0,0,'','','','','','', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deletedPurchaseOrderSearchData = async (req, res) => {
  const { company_code, transaction_no, transaction_date, vendor_code, vendor_name, purchase_type, pay_type } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SCD")
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("transaction_date", sql.NVarChar, transaction_date)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("pay_type", sql.NVarChar, pay_type)
      .query(`EXEC sp_purchase_order_hdr @mode,@company_code,'', @transaction_no,@transaction_date,@purchase_type,@vendor_code,@vendor_name,@pay_type,
          0,0,0,0,0,0,0,0,'','','','','','', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getPurchaseOrderHdr = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_order_hdr @mode,@company_code,'','','','','','','',
          0,0,0,0,0,0,0,0,'','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addPurchaseOrderDetail = async (req, res) => {
  const {company_code, transaction_date, transaction_no, warehouse_code, vendor_code, ItemSNo, item_code, item_name, bill_qty, bill_rate,
    item_amt, weight, total_weight, pay_type, purchase_type,vendor_name, order_type, hsn, tax_amount, created_by} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("purchase_type", sql.NVarChar, purchase_type)
      .input("vendor_name", sql.NVarChar, vendor_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_order_details @mode,@company_code,@transaction_date,@transaction_no,@warehouse_code,@vendor_code,@ItemSNo,@item_code,@item_name,@bill_qty,@bill_rate,
          @item_amt,@weight,@total_weight,@pay_type,@purchase_type,@vendor_name,
          @order_type,@hsn,@tax_amount,'','',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deletePurchaseOrderDetail = async (req, res) => {
  const { company_code, transaction_no } = req.body;

  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("transaction_no", transaction_no)
        .input("company_code", company_code)
        .query(`EXEC sp_purchase_order_details 'D',@company_code,'',@transaction_no,'','',0,'','',0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const getPurchaseOrderDetail = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_order_details 'A',@company_code,'','','','',0,'','',0,0,0,0,0,'','','','','',0,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addPurchaseOrderTaxDet = async (req, res) => {
  const {company_code, transaction_date, transaction_no, vendor_code, pay_type, ItemSNo, TaxSNo, item_code, item_name, tax_type, tax_name_details, tax_amt, tax_per,created_by,} = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("transaction_date", sql.Date, transaction_date)
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("vendor_code", sql.NVarChar, vendor_code)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("TaxSNo", sql.BigInt, TaxSNo)
      .input("item_code", sql.NVarChar, item_code)
      .input("item_name", sql.NVarChar, item_name)
      .input("tax_type", sql.NVarChar, tax_type)
      .input("tax_name_details", sql.NVarChar, tax_name_details)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("tax_per", sql.Decimal(14, 2), tax_per)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_purchase_order_tax_details @mode,@company_code,@transaction_date,@transaction_no,@vendor_code,@pay_type,@ItemSNo,@TaxSNo,@item_code,@item_name,@tax_type,@tax_name_details,
      @tax_amt,@tax_per,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deletePurchaseOrderTaxDet = async (req, res) => {
  const { company_code, transaction_no } = req.body;
  try {
    const pool = await connection.connectToDatabase();
      await pool.request()
        .input("company_code", company_code)
        .input("transaction_no", transaction_no)
        .query(`EXEC sp_purchase_order_tax_details 'D',@company_code,'',@transaction_no,'','',0,0,'','','','',0,0,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.status(200).json("purchase deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({message: err.message || "Internal Server Error"});
  }
};

const getPurhaseOrderTaxDet = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_purchase_order_tax_details @mode,@company_code,'','','','',0,0,'','','','',0,0,'','',''
      ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getPurchaseOrder = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PO")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], 
        table3: result.recordsets[2] || []  
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getDeletedPurchaseOrder = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DPO")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], 
        table3: result.recordsets[2] || []  
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getSalesOrder = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SO")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], 
        table3: result.recordsets[2] || []  
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getDeletedSalesOrder = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DSO")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        table1: result.recordsets[0],
        table2: result.recordsets[1] || [], 
        table3: result.recordsets[2] || []  
      };
      res.status(200).json(data);
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//code ended by pavun on 10-06-25

//code added by pavun on 11-06-25

const getPODetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "POD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDeletedPODetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DPOD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPOTaxDetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "POTD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDeletedPOTaxDetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DPOTD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSODetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SOD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDeletedSODetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DSOD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSOTaxDetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SOTD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getDeletedSOTaxDetail = async (req, res) => {
  const { transaction_no,company_code} = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DSOTD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_getdata @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const printPOHeader = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "POH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

const printPODetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "POD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

const printPOTaxDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "POP")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const printSOHeader = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SOH")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

const printSODetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SOD")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

const printSOTaxDetail = async (req, res) => {
  const { transaction_no, company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SOP")
      .input("transaction_no", sql.NVarChar, transaction_no)
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_tax_Print @mode,@transaction_no,@company_code,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

//code ended by pavun on 11-06-25
//Code Added by Harish on 22-12-25
// Auto-generated Node.js CRUD for sp_Item_Category_Master

const Item_Category_MasterInsert = async (req, res) => {
    const {
      Item_Category_ID,
      Item_Category_Code,
      Item_Category_Name,
      Item_Category_Description,
      Region_Code,
      Country_Code,
      Display_Order,
      Record_Version,
      Row_GUID,
      Source_System,
      Sync_Status,
      company_code,
      created_by
    } = req.body;

    // ✅ FORCE BIT VALUES
    const Is_Default = req.body.Is_Default === "1" ? 1 : 0;
    const Is_Active  = req.body.Is_Active === "1" ? 1 : 0;
    const Is_Deleted = req.body.Is_Deleted === "1" ? 1 : 0;

    let Item_Category_Image = null;
    if (req.file) {
      Item_Category_Image = req.file.buffer;
    }

    try {

      pool = await sql.connect(dbConfig);

    await pool
    .request()
      .input("mode", sql.NVarChar, "I")
      .input("Item_Category_ID", sql.NVarChar, Item_Category_ID)
      .input("Item_Category_Code", sql.NVarChar, Item_Category_Code)
      .input("Item_Category_Name", sql.NVarChar, Item_Category_Name)
      .input("Item_Category_Description", sql.NVarChar, Item_Category_Description)
      .input("Item_Category_Image", sql.VarBinary, Item_Category_Image)
      .input("Region_Code", sql.NVarChar, Region_Code)
      .input("Country_Code", sql.NVarChar, Country_Code)
      .input("Is_Active", sql.Bit, Is_Active)
      .input("Is_Deleted", sql.Bit, Is_Deleted)
      .input("Is_Default", sql.Bit, Is_Default) 
      .input("Display_Order", sql.Int, Display_Order)
      .input("Record_Version", sql.Int, Record_Version )
      .input("Row_GUID", sql.NVarChar, Row_GUID)
      .input("Source_System", sql.NVarChar, Source_System)
      .input("Sync_Status", sql.NVarChar, Sync_Status)
      .input("company_code", sql.NVarChar, company_code)
      .input("created_by", sql.NVarChar, created_by)
      .query(`
        EXEC sp_Item_Category_Master 
          @mode, @Item_Category_ID, @Item_Category_Code, @Item_Category_Name,
          @Item_Category_Description, @Item_Category_Image,
          @Region_Code, @Country_Code, @Is_Active, @Is_Deleted,
          @Is_Default, @Display_Order, @Record_Version,
          @Row_GUID, @Source_System, @Sync_Status,
          '', @company_code, @created_by, '', '', ''
      `);

     return res.status(200).json({ success: true, message: 'Data inserted successfully' });
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const Item_Category_MasterUpdate = async (req, res) => {
  const {
    company_code,
    Item_Category_Code,
    Item_Category_Name,
    Item_Category_Description,
    Region_Code,
    Country_Code,
    Display_Order,
    Record_Version,
    status,
    modified_by
  } = req.body;

  let Item_Category_Image = null;
  if (req.file) Item_Category_Image = req.file.buffer;

  const Is_Default = status == 1 ? 1 : 0;
  const Is_Active = status == 1 ? 1 : 0;

  // 🔑 CRITICAL FIX
  const Keyfield = `${Item_Category_Code}_${company_code}`;

  try {
    pool = await connection.connectToDatabase();

    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("Item_Category_Code", sql.NVarChar, Item_Category_Code)
      .input("Item_Category_Name", sql.NVarChar, Item_Category_Name)
      .input("Item_Category_Description", sql.NVarChar, Item_Category_Description)
      .input("Item_Category_Image", sql.VarBinary, Item_Category_Image)
      .input("Region_Code", sql.NVarChar, Region_Code)
      .input("Country_Code", sql.NVarChar, Country_Code)
      .input("Is_Active", sql.Bit, Is_Active)
      .input("Is_Deleted", sql.Bit, 0)
      .input("Is_Default", sql.Bit, Is_Default)
      .input("Display_Order", sql.Int, Display_Order)
      .input("Record_Version", sql.Int, Record_Version)
      .input("Row_GUID", sql.NVarChar, "")
      .input("Source_System", sql.NVarChar, "")
      .input("Sync_Status", sql.Int, 0)
      .input("Keyfield", sql.NVarChar, Keyfield) 
      .input("company_code", sql.NVarChar, company_code)
      .input("modified_by", sql.NVarChar, modified_by)
      .query(`
        EXEC sp_Item_Category_Master
          @mode,
          '',
          @Item_Category_Code,
          @Item_Category_Name,
          @Item_Category_Description,
          @Item_Category_Image,
          @Region_Code,
          @Country_Code,
          @Is_Active,
          @Is_Deleted,
          @Is_Default,
          @Display_Order,
          @Record_Version,
          @Row_GUID,
          @Source_System,
          @Sync_Status,
          @Keyfield,
          @company_code,
          '',
          '',
          @modified_by,
          ''
      `);

    res.status(200).json("Updated successfully");

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






const Item_Category_MasterDelete = async (req, res) => {
  const { keyfields, modified_by } = req.body;

  if (!keyfields || keyfields.length === 0) {
    return res.status(400).json({ message: "No keyfields provided" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    for (const keyfield of keyfields) {
      await pool.request()
        .input("mode", sql.NVarChar, "D")
        .input("Keyfield", sql.NVarChar, keyfield)
        .input("modified_by", sql.NVarChar, modified_by)
        .query(`  EXEC sp_Item_Category_Master @mode, '', '', '', '', '', '', '', 0, 0, 0, 0, '', '','', '',
            @Keyfield,'', '','', @modified_by, ''
        `);
    }

    res.status(200).json({
      success: true,
      message: "Item categories deleted successfully"
    });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};


const Categorysearch = async (req, res) => {
  const { company_code, Item_Category_Code , Item_Category_Name, Item_Category_Description, Region_Code, Is_Active, Is_Default,Display_Order } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_Category_Code", sql.NVarChar, Item_Category_Code )
      .input("Item_Category_Name", sql.NVarChar, Item_Category_Name)
      .input("Item_Category_Description", sql.NVarChar, Item_Category_Description)
      .input("Region_Code", sql.NVarChar, Region_Code)
      .input("Is_Default", sql.NVarChar, Is_Default)
      .input("Is_Active", sql.NVarChar, Is_Active)
      .input("Display_Order", sql.NVarChar, Display_Order)
      .query(`EXEC sp_Item_Category_Master @mode,'',@Item_Category_Code,@Item_Category_Name,@Item_Category_Description,'',@Region_Code,'',@Is_Active,0,@Is_Default,@Display_Order,'','','','','',@company_code,'','','',''
`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getDefault = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Default','','', '' , '','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};


const CategoryFetch= async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IC")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_Item_Category_Master @mode,'','','','','','','',0,0,0,0,'','','','','',@company_code,'','','',''
`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); 
    } else {
      res.status(404).json("Data not found"); 
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const Item_Category_MasterUpdateRow = async (req, res) => {
  const editedData = req.body.editedData;

  if (!Array.isArray(editedData) || editedData.length === 0) {
    return res.status(400).json("Invalid or empty editedData array");
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const row of editedData) {

      // 🖼 Image handling (Buffer-safe)
      let Item_Category_Image = null;
      if (row.Item_Category_Image?.type === "Buffer") {
        Item_Category_Image = Buffer.from(row.Item_Category_Image.data);
      }

      const Is_Default = row.status == 1 ? 1 : 0;
      const Is_Active = row.status == 1 ? 1 : 0;

      // 🔑 Composite Keyfield (CRITICAL)
      const Keyfield = `${row.Item_Category_Code}_${row.company_code}`;

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("Item_Category_Code", sql.NVarChar, row.Item_Category_Code)
        .input("Item_Category_Name", sql.NVarChar, row.Item_Category_Name)
        .input("Item_Category_Description", sql.NVarChar, row.Item_Category_Description)
        .input("Item_Category_Image", sql.VarBinary(sql.MAX), Item_Category_Image)
        .input("Region_Code", sql.NVarChar, row.Region_Code)
        .input("Country_Code", sql.NVarChar, row.Country_Code)
        .input("Is_Active", sql.Bit, Is_Active)
        .input("Is_Deleted", sql.Bit, 0)
        .input("Is_Default", sql.Bit, Is_Default)
        .input("Display_Order", sql.Int, row.Display_Order)
        .input("Record_Version", sql.Int, row.Record_Version)
        .input("Row_GUID", sql.NVarChar, "")
        .input("Source_System", sql.NVarChar, "")
        .input("Sync_Status", sql.Int, 0)
        .input("Keyfield", sql.NVarChar, Keyfield)
        .input("company_code", sql.NVarChar, row.company_code)
        .input("modified_by", sql.NVarChar, req.headers["modified-by"])
        .query(`
          EXEC sp_Item_Category_Master
            @mode,
            '',
            @Item_Category_Code,
            @Item_Category_Name,
            @Item_Category_Description,
            @Item_Category_Image,
            @Region_Code,
            @Country_Code,
            @Is_Active,
            @Is_Deleted,
            @Is_Default,
            @Display_Order,
            @Record_Version,
            @Row_GUID,
            @Source_System,
            @Sync_Status,
            @Keyfield,
            @company_code,
            '',
            '',
            @modified_by,
            ''
        `);
    }

    res.status(200).json("Item Category rows updated successfully");

  } catch (error) {
    console.error("Item Category Update Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


// Auto-generated Node.js CRUD for sp_Recenty_Viewed


 






module.exports = {
  login,
  forgetPassword,
  signUp,
  verifyOtp,
  getvariant,
  getuom,
  getCity,
  getCountry,
  getState,
  getStatus,
  getTransaction,
  getGender,
  getLoginorout,
  addData,
  userAddData,
  getAlluserData,
  AddWareHouseData,
  getAllWareHouseData,
  getwarehouseSearchdata,
  getAllRoleInfoData,
  AddRoleInfoData,
  RolesaveEditedData,
  saveEditedData,
  deleteData,
  UserdeleteData,
  UsersaveEditedData,
  WareHousesaveEditedData,
  getAllattributehdrData,
  addattrihdrData,
  getAllattributedetData,
  addattridetData,
  updattridetData,
  deleteAttriDetailData,
  gethdrcode,
  gettaxtype,
  getDeletepermission,
  getregisterbrand,
  getourbrand,
  addTaxDetailsData,
  getAllTaxDetailsData,
  updtaxdetaildata,
  addTaxHdrData,
  getAllTaxHdrData,
  getitemsearchdata,
  getAllItemBrandData,
  addItemBrandData,
  deleteItemData,
  getsearchdata,
  getUsercode,
  getUsertype,
  getCompanyno,
  getLocationno,
  getvendorcode,
  getAllVendorHdrData,
  addVendorHdrData,
  getAllVendorDetData,
  addVendorDetData,
  updvendordetData,
  VendordeleteData,
  getAllCompanyMappingData,
  addCompanyMappingData,
  WareHousedeleteData,
  getPaytype,
  getPurchasetype,
  getSalestype,
  getordertype,
  getroleid,
  getAllUserRoleMappingData,
  addUserRoleMappingData,
  gettypeperdata,
  getlocationsearchdata,
  addlocationinfo,
  locationsaveEditedData,
  locationdeleteData,
  getitempursearchdata,
  getUserrolesearchdata,
  getUsersearchdata,
  getRolesearchdata,
  roledeleteData,
  getvendorSearchdata,
  addpurchaseheader,
  getAllpurhdrData,
  addpurchasedetail,
  getAllpurtaxData,
  addpurtaxdetail,
  getAllpurhdetData,
  getTotalAmountCalculation,
  getPartyCode,
  getcompanymappingsearchdata,
  getattributeSearchdata,
  addpurchasereturnheader,
  getAllpurchaseheaderreturnData,
  getpurchasereport,
  gettaxSearchdata,
  getitemcodepurdata,
  getAllsaleshdrData,
  addsaleshdr,
  addsalesdetdetail,
  gettranstype,
  getAllsalestaxdetData,
  addsalestaxdetail,
  getpursearchdata,
  getPurchaseData,
  getsalessearchdata,
  getAllSalesRetHdrData,
  addSalesRetHdr,
  getpurchasereturnit,
  getpurchasereturntax,
  getAllNumberseries,
  addNumberseries,
  getnumberseriessearchdata,
  saveEditedNumberseriesData,
  refNumberToHeaderPrintData,
  refNumberToDetailPrintData,
  refNumberToSumTax,
  addpurchasereturntaxdetails,
  addpurchasereturndetails,
  getpurchasereturndetails,
  getpurchasereturntaxdetails,
  getAllDashboardData,
  getSalesItemAmountCalculation,
  SalesTotalAmountCalculation,
  getItemPrice,
  getProduct,
  getPurchaseReturnItemAmountCalculation,
  getscreentype,
  getDashboardItemData,
  getDashboardStockData,
  getsalesreport,
  Passwords,
  refNumberTosalesHeaderPrintData,
  refNumberTosalesDetailPrintData,
  refNumberTosalesSumTax,
  getitemstockvalue,
  getAllItemVarient,
  getitemvairentname,
  getAllUOM,
  getAlluomdetail,
  numberseriesdeleteData,
  getonlywarehsearchdata,
  getusercompany,
  updateitemData,
  updcompanymapping,
  commappingdeleteData,
  getSalesReturnItemAmountCalculation,
  getSalesData,
  getSalesDetail,
  getSalesTaxDetail,
  getWarehouseCodeData,
  SalesreturnTotalAmountCalculation,
  getAlluserscreenmap,
  adduserscreenmap,
  saveEditeduserscreenmap,
  userscreenmapdeleteData,
  getuserscreensearchdata,
  getScreens,
  getPermissions,
  addSalesRetDetail,
  getAllSalesRetDetailData,
  getAllSalesRetTaxDetailData,
  addSalesRetTaxDetail,
  getAllcustomerhdr,
  addcustomerhdr,
  getAllCustomerDetData,
  addCustomerDetData,
  updcustomerdetData,
  customerSearchdata,
  getcustomercode,
  customerdeleteData,
  refNumberToPurchaseReturnHeaderPrintData,
  refNumberToPurchaseReturnDetailPrintData,
  refNumberToPurachseReturnSumTax,
  refNumberToSalesReturnHeaderPrintData,
  refNumberToSalesReturnDetailPrintData,
  refNumberToSalesReturnSumTax,
  getItemCodeSalesData,
  getCustomerCode,
  purdeletehdrData,
  purDeleteDetailData,
  purDeleteTaxData,
  getUserPermission,
  getPurchaseDeleteDetails,
  getpurDeleteDetails,
  purdeletedunit,
  purdeletedtax,
  getRefSalesDelete,
  getsalesdelsearchdata,
  saledelsearchitem,
  salesdelsearchtax,
  saledeletehdrData,
  saleDeleteDetailData,
  saleDeleteTaxData,
  gettaxitempur,
  gettaxitemsales,
  getDashboardPurchase,
  getDashboardSales,
  getDashboardItemSales,
  getCurrentStock,
  getNegativeStock,
  warehouseDashboard,
  deleteTaxData,
  updTaxdetData,
  getpurchasereturnView,
  UomChart,
  Transdetail,
  partytransdetail,
  alltransdetail,
  datetransdetail,
  getSalesreturnView,
  getpurreturnsearchViewdata,
  getwarehousedrop,
  varientChart,
  getsalesreturnsearchViewdata,
  SalesReturnTaxView,
  SalesReturnDetailView,
  getitemsalsearchdata,
  gettransdetailchart,
  getpurchasereturntaxView,
  getpurchasereturnitView,
  getDateRange,
  getacctype,
  getofftype,
  getItemCodeQuotation,
  getItem,
  getItemCodeDcData,
  purreturndeletehdrData,
  purreturndeletedetData,
  purreturndeletetaxdetData,
  salereturndeletehdrData,
  salereturndeletedetData,
  salereturndeletetaxdetData,
  getAllsalesdetData,
  getAllsalestaxdetData,
  RollMappingDelete,
  purchaseEditHeader,
  updateRoleMapping,
  getUserRole,
  UpdateUserImage,
  getInventoryTransaction,
  getEmptype,
  getCondition,
  PurchaseAuthHdr,
  PurchaseAuthDetail,
  PurchaseAuthTaxDetail,
  SalesAuthHdr,
  SalesAuthDetail,
  SalesAuthTaxDetail,
  PurchReturnAuthHdr,
  PurchReturnAuthDetail,
  PurchReturnAuthTaxDetail,
  SalesReturnAuthHdr,
  SalesReturnAuthDetail,
  SalesReturnAuthTaxDetail,
  // updateitemDataTest,
  UpdateItemImage,
  LocationUpdate,
  CompanyUpdate,
  UpdateCompanyImage,
  RoleUpdate,
  UserUpdate,
  CompanyMappingUpdate,
  RoleMappingUpdate,
  AttributeUpdate,
  NumberSeriesUpdate,
  ItemUpdate,
  TaxUpdate,
  WarehouseUpdate,
  VendorUpdate,
  CustomerUpdate,
  getEvent,
  purauthstatus,
  salauthstatus,
  salretauthstatus,
  purretauthstatus,
  //updpurchasedetail,
  getPurItemAmountCalculation,
  getsiblings,
  getkids,
  getMartial,
  getSalaryType,
  getPayscale,
  getLoanID,
  getShift,
  getDocumentType,
  getCustomerDetails,
  getrelation,
  getCurrentStockDetails,
  getCurrentStockItemCode,
  addOpeningBalanceItemHdr,
  getTotalStockValueDetails,
  openingitemhdr,
  openingitemdelhdr,
  getallOIHdr,
  addOpeningItemDetail,
  deleteOpeningItemDetail,
  allOpeningItemDetail,
  getallOpeningItem,
  openingItemSearch,
  getallOpeningItemDetail,
  getcompanyshift,
  getItemCodeSalesDataQuote,
  getotherpurtax,
  getothersalestax,
  getOverallTAX,
  getItemCodeOtherSalesData,
  getInvocieType,
  getVendorDetails,
  getItemCodeSalesDatatest,
  getcodetest,
  getitemsalsearchdatatest,
  getCodeSalesDatatest,
  getLeaveType,
  getSelectSlot,
  getGstReportAnalysis,
  getDashBoardType,
  getGST,
  getPartyName,
  getGSTReport,
  getItemCode,
  getOpeningItemPeriod,
  getType,
  getAccrual,
  getExceedLeave,
  getLeaveReason,
  getDateWiseItemStock,
  getCustomerCodeDrop,
  getPendingStatus,
  getdefCustomer,
  getitemcodevariant,
  getDefaultoptions,
  getSalesMode,
  getSalesReturnAmountCalculation,
  AddTransactionSettinngs,
  getPurchaseAnalysis,
  getTaskstatus,
  getPriority,
  PendingCustomer,
  getPriority,
  Userdropdown,
  getboolean,
  getDocument,
  updateRoleRights,
  getnegstock,
  getPrint,
  getcopies,
  AddPrintTemplate,
  salesTermsandCondition,
  deleteSalesTermsandCondition,
  getAllSalesTermsandCondition,
  termsandCondition,
  getTermsandConditionSales,
  getDeletedTermsSales,
  Templatesearch,
  customerCodeDropdown,
  PrintTemplates,
  vendorCodeDropdown,
  getSalesItemCode,
  addSalesOrderHdr,
  getSalesOrderHdr,
  salesOrderSearchData,
  deleteSalesOrderHdr,
  deletedSalesOrderSearchData,
  addSalesOrderDetail,
  deleteSalesOrderDetail,
  getSalesOrderDetail,
  addSalesOrderTaxDet,
  deleteSalesOrderTaxDet,
  getSalesOrderTaxDet,
  addPurchaseOrderHdr,
  deletePurchaseOrderHdr,
  PurchaseOrderSearchData,
  deletedPurchaseOrderSearchData,
  getPurchaseOrderHdr,
  addPurchaseOrderDetail,
  deletePurchaseOrderDetail,
  getPurchaseOrderDetail,
  addPurchaseOrderTaxDet,
  deletePurchaseOrderTaxDet,
  getPurhaseOrderTaxDet,
  getPurchaseOrder,
  getDeletedPurchaseOrder,
  getSalesOrder,
  getDeletedSalesOrder,
  getPODetail,
  getDeletedPODetail,
  getPOTaxDetail,
  getDeletedPOTaxDetail,
  getSODetail,
  getDeletedSODetail,
  getSOTaxDetail,
  getDeletedSOTaxDetail,
  printPOHeader,
  printPODetail,
  printPOTaxDetail,
  printSOHeader,
  printSODetail,
  printSOTaxDetail,
  Item_Category_MasterInsert,
  Item_Category_MasterUpdate,
  Item_Category_MasterDelete,
  Categorysearch,
  getDefault,
  CategoryFetch,
  Item_Category_MasterUpdateRow

};