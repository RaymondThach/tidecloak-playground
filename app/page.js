"use client"

import React, { useState, useLayoutEffect, useEffect } from "react";

import {
  FaDiscord,
  FaLinkedin,
  FaGithub,
  FaCheckCircle,
} from "react-icons/fa";

import { SiX } from "react-icons/si"; // Modern X (formerly Twitter) icon

import IAMService from "../lib/IAMService";
import { useAppContext } from "./context/context";
import appService from "../lib/appService";
// Required for the Approval and Commit Tide Encalve to work in the admin console.
import { Heimdall } from "../tide-modules/heimdall";

function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}


// useLayoutEffect(() => {
//     let i = 0;
//     const interval = setInterval(() => {
//       setDisplayed((prev) =>
//         text
//           .split('')
//           .map((char, idx) => {
//             if (idx < i) return text[idx];
//             return chars[Math.floor(Math.random() * chars.length)];
//           })
//           .join('')
//       );
//       i++;
//       if (i > text.length) clearInterval(interval);
//     }, speed);

//     return () => clearInterval(interval);
//   }, [text, speed]);

// function DecryptedRow({ index, isUser, username, dob, cc, canRead }) {
//   const [decrypted, setDecrypted] = useState(false);
//   const [decryptionStatus, setDecryptionStatus] = useState("");
//   const [animating, setAnimating] = useState(false);

//   const handleDecrypt = () => {
//     if (!isUser) {
//       setDecryptionStatus("Access denied: You don't have decryption rights.");
//       setTimeout(() => setDecryptionStatus(""), 3000);
//       return;
//     }

//     if (!canRead) {
//       setDecryptionStatus("Access denied: You lack read permission.");
//       setTimeout(() => setDecryptionStatus(""), 3000);
//       return;
//     }

//     setAnimating(true);
//     setTimeout(() => {
//       setDecrypted(true);
//       setAnimating(false);
//       setDecryptionStatus("Decrypted successfully!");
//       setTimeout(() => setDecryptionStatus(""), 3000);
//     }, 800);
//   };


//   return (
//     <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
//       <div className="text-sm font-mono break-all">
//         <strong className="block text-gray-600 text-xs uppercase mb-1">Username</strong>
//         {username}
//       </div>

//       <div className="text-sm font-mono break-all">
//         <strong className="block text-gray-600 text-xs uppercase mb-1">Date of Birth</strong>
//         <span className={`inline-block transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}>
//           {isUser && decrypted && dob ? <DecryptingText text={dob} /> : "a3f9e4...92c0"}
//         </span>
//       </div>

//       <div className="text-sm font-mono break-all">
//         <strong className="block text-gray-600 text-xs uppercase mb-1">Credit Card</strong>
//         <span className={`inline-block transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}>
//           {isUser && decrypted && cc ? <DecryptingText text={cc} /> : "b7e8c1...e1af"}
//         </span>
//       </div>

//       <div className="flex items-center gap-3">
//         <Button onClick={handleDecrypt} disabled={decrypted}>
//           {decrypted ? "✓ Decrypted" : "Decrypt"}
//         </Button>

//         {decryptionStatus && (
//           <span
//             className={`text-sm ${decryptionStatus.startsWith("Access") ? "text-red-600" : "text-green-600"}`}
//           >
//             {decryptionStatus}
//           </span>
//         )}
//       </div>

//     </div>
//   );
// }




// function DatabaseExposureTable({ jwt, formData }) {


//   return (
//     <div className="mt-6 space-y-6 pb-10 md:pb-16">
//       {[0, 1, 2].map((i) => (
//         <DecryptedRow
//           key={i}
//           index={i}
//           isUser={i === 0}
//           username={`user_${"x".repeat(44)}${i}`}
//           dob={i === 0 ? formData.dob : jwt?.permissions?.dob?.read ? "1990-05-21" : null}
//           cc={i === 0 ? formData.cc : jwt?.permissions?.cc?.read ? "4111-xxxx-xxxx-1234" : null}
//           canRead={jwt?.permissions?.dob?.read || jwt?.permissions?.cc?.read}
//         />

//       ))}
//     </div>
//   );
// }


// Main App Component

export default function App() {
  const [jwt, setJwt] = useState(null);
  //const [page, setPage] = useState("Landing");
  const [showExplainer, setShowExplainer] = useState(false);
  const [requests, setRequests] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [expandedBlobs, setExpandedBlobs] = useState({});
  const [userFeedback, setUserFeedback] = useState("");
  const [showUserInfoAccordion, setShowUserInfoAccordion] = useState(false);
  const [showAdminAccordion, setShowAdminAccordion] = useState(false);
  const [showLoginAccordion, setShowLoginAccordion] = useState(false);
  const [showChangeRequestAccordion, setShowChangeRequestAccordion] = useState(false);
  const [showExposureAccordion, setShowExposureAccordion] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);

  const {realm, baseURL, page, setPage} = useAppContext();
  const [loading, setLoading] = useState(true);
  const [loggedUser, setLoggedUser] = useState();
  const [users, setUsers] = useState([]);
  const [encryptedDob, setEncryptedDob] = useState("");
  const [encryptedCc, setEncryptedCc] = useState("");
  const [isTideAdmin, setIsTideAdmin] = useState(false);
  // Realm Management client ID to check if user has the tide-realm-admin role yet
  const [RMClientID, setRMClientID] = useState("");

  


  // Initiate Keycloak to handle token and Tide enclave
  useEffect(() => {
    IAMService.initIAM(() => {
      if (IAMService.isLoggedIn()){
        
        setPage("User");                                                                    // TODO: Temporary
        // Set the access token if logged in on initial render
        const token = async () => {setJwt(await IAMService.getToken())};                    // TODO: Temporary
        token();
        getAllUsers();
      }
      setLoading(false);
    });
  }, [])

  // Checking for token
  useEffect(() => {
    if(jwt){
      console.log(jwt)
    };
  }, [jwt])

  const [formData, setFormData] = useState({
    dob: "",
    cc: ""
  });

  const [savedData, setSavedData] = useState({ dob: "", cc: "" });

  const handleUserFieldChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Get all users, and find the logged in user's data based on the vuid from the token
  const getAllUsers = async () => { 
    try {
      const token = await IAMService.getToken();
      const users = await appService.getUsers(baseURL, realm, token);
      setUsers(users);
      const loggedVuid = IAMService.getValueFromToken("vuid");
      const user = users.find(user => {
        if (user.attributes.vuid[0] === loggedVuid){
          return user;
        }
      });
      console.log(user);
      setLoggedUser(user);
  
      // Fill the fields if logged user has the attributes
      if (user.attributes.dob){
        // Display this in accordion
        setEncryptedDob(user.attributes.dob);
        // DOB format in Keycloak needs to be "YYYY-MM-DD" to display
        const decryptedDob = await IAMService.doDecrypt([
          {
            "encrypted": user.attributes.dob[0],
            "tags": ["dob"]
          }
        ])
        //user.attributes.dob = decryptedDob[0]; 
        setFormData(prev => ({...prev, dob: decryptedDob}));
        setSavedData(prev => ({...prev, dob: decryptedDob}));
      }
  
      if (user.attributes.cc){
        // Display this in accordion
        setEncryptedCc(user.attributes.cc);
        const decryptedCc = await IAMService.doDecrypt([
          {
            "encrypted": user.attributes.cc[0],
            "tags": ["cc"]
          }
        ])
        //user.attributes.cc = decryptedCc[0];
        setFormData(prev => ({...prev, cc: decryptedCc}));
        setSavedData(prev => ({...prev, cc: decryptedCc}));
      }
    } catch (error){
      console.log(error);
    }
  };

  const handleLogin = () => {
    IAMService.doLogin();
  };

  const handleLogout = () => {
    IAMService.doLogout();
  };

  const shortenString = (string) => {
    const start = string.slice(0, 20);
    const end = string.slice(20);
    return `${start}...${end}`;
  } 


  // Animation
  function DecryptingText({ text, speed = 30 }) {
    const [displayed, setDisplayed] = useState('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  
    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed((prev) =>
          text
            .split('')
            .map((char, idx) => {
              if (idx < i) return text[idx];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        i++;
        if (i > text.length) clearInterval(interval);
      }, speed);
  
      return () => clearInterval(interval);
    }, [text, speed]);
  
    return <span className="font-mono text-green-600">{displayed}</span>;
  }
  
  
  function DecryptedRow({ isUser, user, username, dob, cc, canRead }) {
    const [decrypted, setDecrypted] = useState(false);
    const [decryptionStatus, setDecryptionStatus] = useState("");
    const [animating, setAnimating] = useState(false);
    const [decryptedDob, setDecryptedDob] = useState("");
    const [decryptedCc, setDecryptedCc] = useState("");
    // Calls on Decrypt button being selected to update the fields
    const handleDecrypt = () => {

      if (!isUser) {
        setDecryptionStatus("Access denied: You don't have decryption rights.");
        setTimeout(() => setDecryptionStatus(""), 3000);
        return;
      }
  
      if (!canRead) {
        setDecryptionStatus("Access denied: You lack read permission.");
        setTimeout(() => setDecryptionStatus(""), 3000);
        return;
      }
  
      setAnimating(true);
      setTimeout(async () => {
        const decryptedDobData = await IAMService.doDecrypt([
          {
            "encrypted": user.attributes.dob[0],
            "tags": ["dob"]
          }
        ])
        setDecryptedDob(decryptedDobData[0]); 

        const decryptedCcData = await IAMService.doDecrypt([
          {
            "encrypted": user.attributes.cc[0],
            "tags": ["cc"]
          }
        ])
        setDecryptedCc(decryptedCcData[0]); 

        setDecrypted(true);
        setAnimating(false);
        setDecryptionStatus("Decrypted successfully!");
        setTimeout(() => setDecryptionStatus(""), 3000);
      }, 800);
    };
  
  
    return (
      <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
        <div className="text-sm font-mono break-all">
          <strong className="block text-gray-600 text-xs uppercase mb-1">Username</strong>
          {username}
        </div>
  
        <div className="text-sm font-mono break-all">
          <strong className="block text-gray-600 text-xs uppercase mb-1">Date of Birth</strong>
          <span className={`inline-block transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}>
            {isUser && decrypted && dob ? <DecryptingText text={decryptedDob} /> : user.attributes.dob}
          </span>
        </div>
  
        <div className="text-sm font-mono break-all">
          <strong className="block text-gray-600 text-xs uppercase mb-1">Credit Card</strong>
          <span className={`inline-block transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}>
            {isUser && decrypted && cc ? <DecryptingText text={decryptedCc} /> : user.attributes.dob}
          </span>
        </div>
  
        <div className="flex items-center gap-3">
          <Button onClick={handleDecrypt} disabled={decrypted}>
            {decrypted ? "✓ Decrypted" : "Decrypt"}
          </Button>
  
          {decryptionStatus && (
            <span
              className={`text-sm ${decryptionStatus.startsWith("Access") ? "text-red-600" : "text-green-600"}`}
            >
              {decryptionStatus}
            </span>
          )}
        </div>
  
      </div>
    );
  }

  function DatabaseExposureTable() {

    return (
      <div className="mt-6 space-y-6 pb-24 md:pb-36">
        {users.map((user, i) => (
          <DecryptedRow key={i}
            isUser={user.attributes.vuid[0] === IAMService.getValueFromToken("vuid")}
            user={user}
            username={user.username}
            dob={IAMService.hasOneRole("_tide_dob.read") ? user.attributes.dob : null}
            cc={IAMService.hasOneRole("_tide_cc.read") ? user.attributes.cc : null}
            canRead={IAMService.hasOneRole("_tide_dob.read") || IAMService.hasOneRole("_tide_cc.read")}
          />
  
        ))}
      </div>
    );
  }

  const handleElevateClick = () => setShowExplainer(true);

  const handleAdminButton = async () => {
    const token = await IAMService.getToken();
    
    // Get Realm Management default client's ID
    const clientID = await appService.getRealmManagementId(baseURL, realm, token);
    setRMClientID(clientID);
    
    // Check if user already has the role
    setIsTideAdmin(await appService.checkUserAdminRole(baseURL, realm, loggedUser.id, clientID, token));
    setPage("Admin");
  };

  // Assign this initial user the tide-realm-admin client role managed by the default client Realm Management
  const confirmAdmin = async () => {
    const token = await IAMService.getToken();

    if (!isTideAdmin){
      // Get the tide-realm-admin role to assign
      const tideAdminRole = await appService.getTideAdminRole(baseURL, realm, loggedUser.id, RMClientID, token);
      console.log(tideAdminRole);

      // Assign the tide-realm-admin role to the logged in user
      const assignResponse = await appService.assignClientRole(baseURL, realm, loggedUser.id, RMClientID, tideAdminRole, token);
      console.log(assignResponse);

      // Back end functionality required to approve and commit user with tide-realm-admin role using a master token
      const response = await fetch(`/api/commitAdminRole`);

      if (response.ok) {
        setIsTideAdmin(true);
        console.log("Admin Role Assigned");
        // Force update of token without logging out? IAMService => tidecloak updateToken() maybe.
      }
    }
    else {
      setIsTideAdmin(true);
    }
  };

  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      if (formData.dob !== ""){
        const encryptedDob = await IAMService.doEncrypt([
          {
            "data": formData.dob,
            "tags": ["dob"]
          }
        ]);
        loggedUser.attributes.dob = encryptedDob[0];
        setEncryptedDob(encryptedDob[0]);
      }
  
      if (formData.cc !== ""){
        const encryptedCc = await IAMService.doEncrypt([
          {
            "data": formData.cc,
            "tags": ["cc"]
          }
        ]);
        loggedUser.attributes.cc = encryptedCc[0];
        setEncryptedCc(encryptedCc[0]);
      }
  
      const token = await IAMService.getToken();
      const response = await appService.updateUser(baseURL, realm, loggedUser, token);

      if (response.ok){
        setSavedData({ ...formData });
        setUserFeedback("Changes saved!");
        setTimeout(() => setUserFeedback(""), 3000); // clear after 3 seconds
        console.log("Updated User!");
      }

    }
    catch (error) {
      console.log(error);
    }
    
  };


  const handleAdminPermissionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updated = {
      dob: { read: false, write: false },
      cc: { read: false, write: false }
    };

    for (let [key] of formData.entries()) {
      const [field, permission] = key.split(".");
      updated[field][permission] = true;
    }

    const isDifferent = Object.keys(updated).some(field => {
      return (
        updated[field].read !== IAMService.hasOneRole("_tide_" + field + ".read") ||
        updated[field].write !== IAMService.hasOneRole("_tide_" + field + ".write")
      );
    });

    if (isDifferent) {

      // const newRequest = {
      //   id: Date.now() + Math.random(),
      //   date: new Date().toLocaleDateString(),
      //   type: `Permission Bundle`,
      //   value: updated,
      //   status: "Draft",
      //   json: JSON.stringify(updated, null, 2),
      //   field: null
      // };
      const token = await IAMService.getToken();
      Object.keys(updated).forEach(async (field) => {
        // Read fields 
        const readRole = await appService.getRealmRole(baseURL, realm, "_tide_" + field + ".read", token);
        if (updated[field].read !== IAMService.hasOneRole("_tide_" + field + ".read") && updated[field].read === false){
          const response = await appService.unassignRealmRole(baseURL, realm, loggedUser.id, readRole, token);
          console.log(response);
        }
        else if (updated[field].read !== IAMService.hasOneRole("_tide_" + field + ".read") && updated[field].read === true){
          const response = await appService.assignRealmRole(baseURL, realm, loggedUser.id, readRole, token);
          console.log(response);
        }

        // Write fields
        const writeRole = await appService.getRealmRole(baseURL, realm, "_tide_" + field + ".write", token);
        if (updated[field].write !== IAMService.hasOneRole("_tide_" + field + ".write") && updated[field].write === false){
          const response = await appService.unassignRealmRole(baseURL, realm, loggedUser.id, writeRole, token);
          console.log(response);
        }
        else if (updated[field].write !== IAMService.hasOneRole("_tide_" + field + ".write") && updated[field].write === true){
          const response = await appService.assignRealmRole(baseURL, realm, loggedUser.id, writeRole, token);
          console.log(response);
        }

        const changeRequests = await appService.getUserRequests(baseURL, realm, token);
        setRequests(changeRequests); // overwrite previous request
        console.log(changeRequests);
        setHasChanges(false);
      });
    }
  };


  // const handleReview = (id) => {
  //   setRequests(prev =>
  //     prev.map(req =>
  //       req.id === id && req.status === "Draft"
  //         ? { ...req, status: "Pending" }
  //         : req
  //     )
  //   );
  // };

  function AccordionBox({ title, children, isOpen }) {
    return (
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          } bg-slate-50 border-l-4 border-blue-500 rounded-md shadow-inner px-5 py-0 mb-4 text-sm space-y-3 ring-1 ring-slate-300`}
      >
        {isOpen && (
          <div className="py-5">
            {title && (
              <h4 className="text-base font-bold text-blue-900 tracking-wide uppercase">
                {title}
              </h4>
            )}
            <div className="text-slate-700 leading-relaxed">{children}</div>
          </div>
        )}
      </div>
    );
  }
  
  
  function QuorumDashboard({ request, onCommit, setPage, setRequests }) {
    let requestStatus;
    if (request.deleteStatus){
      requestStatus = request.deleteStatus;
    }
    else { 
      requestStatus = request.status
    }
  
    if (requestStatus === "Committed") {
      return (
        <div className="bg-white border rounded-lg p-6 shadow space-y-4 mt-8">
  
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Change Request</h3>
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-blue-100 text-blue-800">
              Committed
            </span>
          </div>
  
          <pre className="bg-gray-50 border text-sm rounded p-4 overflow-auto">
            <p>test</p>
          </pre>
          <div className="mt-4">
            <div className="text-sm text-gray-700 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>Done! You can now explore the updated permissions.</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage("User");
                }}
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                View on User Page →
              </a>
            </div>
          </div>
  
        </div>
      );
    }
  
    const ADMIN_NAMES = ["You", "Alice", "Bob", "Carlos", "Dana"];
    const isCommitted = requestStatus === "Committed";
    const isApproved = requestStatus === "Approved" || isCommitted;
    const [hasUserApproved, setHasUserApproved] = useState(isCommitted || isApproved);
  
    const [approvals, setApprovals] = useState([false, false, false, false, false]);
    const [canCommit, setCanCommit] = useState(false);
  
    useEffect(() => {
      const isCommitted = requestStatus === "Committed";
      const isApproved = requestStatus === "Approved";
  
      if (isCommitted) {
        setHasUserApproved(true);
        setApprovals([true, true, true, true, true]);
        setCanCommit(false);
        return;
      }
  
      if (isApproved) {
        setHasUserApproved(true);
        setApprovals([true, true, true, false, false]);
        setCanCommit(true);
        return;
      }
  
      // Reset for new request
      setHasUserApproved(false);
      setApprovals([false, false, false, false, false]);
      setCanCommit(false);
    }, [request?.id]);
  
  
    useEffect(() => {
      if (hasUserApproved) {
        const others = [1, 2, 3, 4];
        const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 2);
  
        shuffled.forEach((index, i) => {
          setTimeout(() => {
            setApprovals(prev => {
              const updated = [...prev];
              updated[index] = true;
  
              // 🟢 Check if quorum is reached and status needs to be bumped
              const totalApproved = updated.filter(Boolean).length;
              if (totalApproved >= 3 && requestStatus !== "Approved") {
                setRequests(prev =>
                  prev.map(r => r.id === request.id ? { ...r, status: "Approved" } : r)
                );
              }
  
  
              return updated;
            });
          }, (i + 1) * 900);
        });
  
        setTimeout(() => {
          setCanCommit(true);
        }, 3.2 * 1000);
      }
    }, [hasUserApproved]);
  
    // POST /tideAdminResources/add-rejection
    // Add denied status to change request 
    const addRejection = async (action, draftId, type) => {
      const token = await IAMService.getToken();    
      
      // Key value pairs
      const formData = new FormData();
      formData.append("actionType", action);
      formData.append("changeSetId", draftId);
      formData.append("changeSetType", type);

      const response = await appService.denyEnclave(baseURL, realm, formData, token);
      if (response.ok){
        appService.getUserRequests(baseURL, realm, token);
      } 
    };

    //POST /tideAdminResources/add-authorization
    // Add approve status to change request
    const addApproval = async (action, draftId, type, authorizerApproval, authorizerAuthentication) => {
      const token = await IAMService.getToken();

      // Key value pairs
      const formData = new FormData();
      formData.append("actionType", action);
      formData.append("changeSetId", draftId);
      formData.append("changeSetType", type);
      formData.append("authorizerApproval", authorizerApproval);
      formData.append("authorizerAuthentication", authorizerAuthentication);
    
      const response = await appService.approveEnclave(baseURL, realm, formData, token);
      if (response.ok){
        appService.getUserRequests(baseURL, realm, token);
      }
      
    };

    const handleUserApprove = async (changeRequest) => {
      console.log(changeRequest);
      const token = await IAMService.getToken();
      // Get popup data for the change request to know that it requires the enclave and pass data to the popup
      const response = await appService.reviewChangeRequest(baseURL, realm, changeRequest, token);
      const popupData = await response.json();
  
      if (popupData.requiresApprovalPopup === "true") {
        const vuid = await IAMService.getValueFromToken("vuid");
        const heimdall = new Heimdall(popupData.customDomainUri, [vuid]);
        await heimdall.openEnclave();
      
        // Waiting user response for auth approval
        const authorizerApproval = await heimdall.getAuthorizerApproval(popupData.changeSetRequests, "UserContext:1", popupData.expiry, "base64url");
        
        // If Deny is clicked
        if (authorizerApproval.accepted === false) {
          addRejection(changeRequest.actionType, changeRequest.draftRecordId, changeRequest.changeSetType);
          heimdall.closeEnclave(); 
        } else if (authorizerApproval.accepted === true) { // If Approve is clicked
          const authorizerAuthentication = await heimdall.getAuthorizerAuthentication();
          addApproval(changeRequest.actionType, changeRequest.draftRecordId, changeRequest.changeSetType, authorizerApproval.data, authorizerAuthentication);
          heimdall.closeEnclave();
        }
    };

  
      setApprovals(prev => {
        const updated = [...prev];
        updated[0] = true;
        return updated;
      });
  
      setHasUserApproved(true);
  
      // Let parent know we're reviewing (mark as "Pending")
      if (requestStatus === "Draft") {
        requestStatus = "Pending"; // this is ok temporarily for local display
      }
    };
  
  
    return (
      <div className="bg-white border rounded-lg p-6 shadow space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Change Request</h3>
          {requestStatus && (
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide
          ${requestStatus === "Draft" ? "bg-gray-200 text-gray-800" :
            requestStatus === "Pending" ? "bg-yellow-100 text-yellow-800" :
            requestStatus === "Approved" ? "bg-green-100 text-green-800" :
            requestStatus === "Committed" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                }`}
            >
              {requestStatus}
            </span>
          )}
        </div>
  
        <pre className="bg-gray-50 border text-sm rounded p-4 overflow-auto">
          {JSON.stringify(request.value, null, 2)}
        </pre>
  
        <div className="flex justify-between items-center mt-6">
          {ADMIN_NAMES.map((name, idx) => (
            <div key={name} className="relative flex flex-col items-center">
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full border-4 transition-all duration-700 ease-in-out 
          ${approvals[idx] ? "border-green-500 shadow-md shadow-green-200" : "border-gray-300"}
        `}
              >
                <span className="font-semibold text-lg text-gray-700">{name[0]}</span>
              </div>
              <span className="text-xs mt-2 text-gray-600">{name}</span>
  
              {/* Tick overlay – doesn't shift layout */}
              {approvals[idx] && (
                <FaCheckCircle className="absolute top-0 right-0 text-green-500 w-4 h-4 transition-opacity duration-500 translate-x-2 -translate-y-2" />
              )}
            </div>
          ))}
  
        </div>
  
        <div className="pt-4">
          {!hasUserApproved && !isCommitted ? (
            <Button onClick={() => handleUserApprove(request)}>
              Review
            </Button>
  
          ) : requestStatus === "Committed" ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("User");
              }}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              View on User Page →
            </a>
  
          ) : canCommit ? (
            <Button className="bg-green-600 hover:bg-green-700" onClick={onCommit}>
              Commit
            </Button>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Awaiting quorum: <strong>{approvals.filter(Boolean).length} / 3</strong> approved
            </p>
          )}
        </div>
  
      </div >
    );
  }


  return (
    !loading
    ?
    <div className="min-h-screen flex flex-col bg-white">
      {IAMService.isLoggedIn() && (
        <nav className="flex justify-start gap-4 px-8 py-4 border-b border-gray-200">
          <button
            onClick={() => setPage("User")}
            className={`px-4 py-2 rounded transition ${page === "User" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
          >
            User
          </button>
          <button
            onClick={() => handleAdminButton()}
            className={`px-4 py-2 rounded transition ${page === "Admin" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
          >
            Administration
          </button>
          <Button onClick={handleLogout}>Logout</Button>
        </nav>
      )}

      <main className="flex-grow w-full pt-6 pb-16">

        <div className="w-full px-8 max-w-screen-md mx-auto flex flex-col items-start gap-8">
          <div className="w-full max-w-3xl">
            {page === "Landing" && (
              <div key="user" className="space-y-4 relative pb-32 md:pb-40">

                {/* Accordion Toggle for Landing Page */}
                <button
                  onClick={() => setShowLoginAccordion(prev => !prev)}
                  className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                  aria-label="Toggle explainer"
                >
                  {showLoginAccordion ? "🤯" : "🤔"}
                </button>

                {/* Accordion Content */}
                <AccordionBox title="Why is this login special?" isOpen={showLoginAccordion}>
                  <p>
                    This login page showcases <strong>TideCloak's decentralized IAM model</strong>.
                  </p>
                  <p>
                    Admin powers, even login elevation, are <strong>quorum-controlled</strong> — not granted unilaterally.
                  </p>
                  <p>
                    The system itself has no backdoor. That’s the point.
                  </p>
                </AccordionBox>



                <div className="bg-blue-50 rounded shadow p-6 space-y-4">
                  <h2 className="text-3xl font-bold">Welcome to your demo app</h2>
                  <p>Traditional IAM is only as secure as the admins and systems managing it. TideCloak fundamentally removes this risk, by ensuring no-one holds the keys to the kingdom. Explore to learn how.</p>
                  <h3 className="text-xl font-semibold">BYOiD</h3>
                  <p className="text-base">Login or create an account to see the user experience demo.</p>
                  <Button onClick={handleLogin}>Login</Button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold mb-2">TideCloak Administration</h3>
                  <p className="mb-4">Check out the backend of TideCloak, your fully fledged IAM system.</p>
                  <div className="border border-dashed border-gray-500 p-4">
                    <ul className="list-disc list-inside">
                      <li>
                        Visit: <a href="http://xxxxxxxxxxxxxxxxxxxxx" className="text-blue-600">http://xxxxxxxxxxxxxxxxxxxxx</a>
                      </li>
                      <li>Use Credentials: admin / password</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {page === "User" && (
              <div key="user" className="space-y-4 relative">
                {/* Accordion toggle */}
                <button
                  onClick={() => setShowUserInfoAccordion(prev => !prev)}
                  className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                  aria-label="Toggle explanation"
                >
                  {showUserInfoAccordion ? "🤯" : "🤔"}
                </button>

                {/* Accordion content */}
                <AccordionBox title="Why is this special?" isOpen={showUserInfoAccordion}>
                  <p>
                    You’re seeing <strong>dynamic user field access</strong> in action. The form respects granular permissions
                    (read, write, none) in real time.
                  </p>
                  <p>
                    Access is governed by <strong>immutable policy requests</strong>, and changes are enforced only through
                    quorum approvals — including admin access itself.
                  </p>
                </AccordionBox>


                <h2 className="text-3xl font-bold mb-4">User Information</h2>

                <p className="text-sm text-gray-600 mb-6">This form is powered by real-time permission logic. Your ability to view or edit each field depends on your current access.</p>

                <form className="space-y-6" onSubmit={handleFormSubmit}>
                  {
                    ["dob", "cc"].map((field) => {
                      const readPerms = IAMService.hasOneRole(field === "dob"? "_tide_dob.read" : "_tide_cc.read");
                      const writePerms = IAMService.hasOneRole(field === "dob"? "_tide_dob.write" : "_tide_cc.write");
                      const canRead = readPerms? true: false;
                      const canWrite = writePerms? true: false;
                      const label = field === "dob" ? "Date of Birth" : "Credit Card Number";
                      if (!canRead && !canWrite) return null; // hide if no access

                      return (
                        <div key={field}>
                          <label className="block font-medium text-sm mb-1">{label}</label>
                          {canRead && canWrite && (
                            <input
                              type={field === "dob" ? "date" : "text"}
                              value={formData[field]}
                              onChange={handleUserFieldChange(field)}
                              className="border rounded px-3 py-2 w-full max-w-md"
                            />
                          )}

                          {canRead && !canWrite && (
                            <input
                              type="text"
                              value={savedData[field] || ""}
                              readOnly
                              className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-700 max-w-md"
                            />
                          )}

                          {!canRead && canWrite && (
                            <input
                              type={field === "dob" ? "date" : "text"}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              value={formData[field]}
                              onChange={handleUserFieldChange(field)}
                              className="border rounded px-3 py-2 w-full max-w-md"
                            />
                          )}

                          {showUserInfoAccordion && (
                            <div className="text-xs text-gray-600 mt-2 space-y-2 bg-gray-50 border border-gray-200 rounded p-3">
                              <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
                                JWT Permissions & Encrypted Value
                              </h5>
                              <div className="flex gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${canRead ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {canRead ? "✓" : "✕"} Read
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${canWrite ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {canWrite ? "✓" : "✕"} Write
                                </span>
                              </div>

                              <p>
                                <span className="font-medium">Value in Database:</span>{" "}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBlobs((prev) => ({ ...prev, [field]: !prev[field] }))
                                  }
                                  className="text-blue-600 underline"
                                >
                                  {
                                    field === "dob" 
                                    ? expandedBlobs[field]
                                      ? encryptedDob
                                      : shortenString(encryptedDob)
                                    : expandedBlobs[field]
                                      ? encryptedCc
                                      : shortenString(encryptedCc)
                                    
                                    
                                  }
                                </button>
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  }
                  {
                  (IAMService.hasOneRole("_tide_dob.write") || IAMService.hasOneRole("_tide_cc.write")) && (
                    <div className="flex items-center gap-3">
                      <Button type="submit">Save Changes</Button>
                      {userFeedback && (
                        <span className="text-sm text-green-600 font-medium">{userFeedback}</span>
                      )}
                    </div>

                  )}
                </form>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">Database Exposure Simulation</h3>

                    <button
                      onClick={() => setShowExposureAccordion(prev => !prev)}
                      className="text-2xl hover:scale-110 transition-transform"
                      aria-label="Toggle explanation"
                    >
                      {showExposureAccordion ? "🤯" : "🤔"}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">This simulates a user table leak through unprotected API or misconfigured server.</p>

                  <AccordionBox title="What does this simulate?" isOpen={showExposureAccordion}>
                    <p>
                      This simulation shows what happens when an encrypted user table is leaked.
                      Try decrypting your own row — other rows will remain locked unless you have access.
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowDeepDive(prev => !prev)}
                        className="flex items-center gap-2 ml-auto text-xs font-medium text-blue-700 hover:text-blue-900 transition"
                        aria-label="Show technical explanation"
                      >
                        <span className="underline">Technical Deep Dive</span>
                        <span className="text-xl">🤓</span>
                      </button>
                    </div>

                    {showDeepDive && (
                      <div className="mt-3 border-t pt-4 space-y-3 text-xs text-gray-700">
                        <p>
                          🔐 Each record is encrypted at rest. Even if the table is exfiltrated, fields like DOB and CC remain opaque unless a valid JWT with <code className="bg-gray-100 px-1 py-0.5 rounded">read</code> rights is presented.
                          The decryption flow references permissions attached to the JWT — not role-based access.
                        </p>
                        <div className="w-full overflow-auto">
                          <img
                            src="/diagrams/db-decrypt-flow.svg"
                            alt="Decryption permission flow diagram"
                            className="w-full max-w-md border rounded shadow"
                          />
                        </div>
                        <p className="italic text-gray-500">
                          Excerpted from the <a href="https://github.com/tide-foundation/tidecloakspaces" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">TideCloakSpaces</a> repo.
                        </p>
                      </div>
                    )}
                  </AccordionBox>


                  <DatabaseExposureTable />

                </div>

              </div>

            )}

            {page === "Admin" && (
              <div key="admin" className="space-y-6 relative">

                {/* Accordion Icon */}
                <button
                  onClick={() => setShowAdminAccordion(prev => !prev)}
                  className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                  aria-label="Toggle explanation"
                >
                  {showAdminAccordion ? "🤯" : "🤔"}
                </button>

                {/* Accordion Content */}
                <AccordionBox title="What makes TideCloak special?" isOpen={showAdminAccordion}>
                  <ul className="list-disc list-inside">
                    <li><strong>Decentralized quorum-based approval</strong></li>
                    <li>Immutable audit logs</li>
                    <li>Granular control over sensitive fields</li>
                  </ul>
                  <p>
                    So you don’t worry about{" "}
                    <a href="#" className="text-blue-600 underline">permission sprawl</a>,{" "}
                    <a href="#" className="text-blue-600 underline">forgotten admin accounts</a>, or{" "}
                    <a href="#" className="text-blue-600 underline">over-permissioned users</a>.
                  </p>
                </AccordionBox>



                {!isTideAdmin && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold mb-4">Administration</h2>
                    <p className="text-sm text-gray-600 mb-6">This page demonstrates how user privileges can be managed in App, and how the app is uniquely protected against a compromised admin.</p>
                    {!showExplainer ? (
                      <Button onClick={handleElevateClick}>Elevate to Admin Role</Button>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded space-y-3">
                        <p className="font-semibold text-yellow-800">“Yeah, but doesn't the fact you can do this undermine the whole 'quorum-enforced' thing?”</p>
                        <p className="text-sm text-yellow-900">
                          Can’t get anything past you! This ability highlights the usual flaw in IAM systems — that the system itself can assign powers at will.
                          With TideCloak, once hardened with a quorum, even the system can't unilaterally grant admin rights.
                          <br /><br /><strong>For this demo, you're a quorum of one.</strong>
                        </p>
                        <Button onClick={confirmAdmin}>Continue as Admin</Button>
                      </div>
                    )}
                  </div>
                )}

                {isTideAdmin && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold mb-4">Administration</h2>
                    <p className="text-sm text-gray-700">
                      Change your permissions to demo the quorum-enforced workflow for change requests, then check out how the permission changes affect the User experience on the User page.
                    </p>
                    <form
                      onSubmit={handleAdminPermissionSubmit}
                      onChange={() => setHasChanges(true)}
                      className="space-y-6"
                    >
                      <div className="border rounded-lg p-6 bg-white shadow-sm space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">User Permissions</h4>

                        {/* Date of Birth */}
                        <div>
                          <label className="block font-semibold text-sm mb-1">Date of Birth</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="dob.read" defaultChecked={IAMService.hasOneRole("_tide_dob.read")} />
                              <span>Read</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="dob.write" defaultChecked={IAMService.hasOneRole("_tide_dob.write")} />
                              <span>Write</span>
                            </label>
                          </div>
                        </div>

                        {/* Credit Card Number */}
                        <div>
                          <label className="block font-semibold text-sm mb-1">Credit Card Number</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="cc.read" defaultChecked={IAMService.hasOneRole("_tide_cc.read")} />
                              <span>Read</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="cc.write" defaultChecked={IAMService.hasOneRole("_tide_cc.write")} />
                              <span>Write</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" disabled={!hasChanges}>Submit Changes</Button>
                    </form>



                    {requests.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowChangeRequestAccordion(prev => !prev)}
                          className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                          aria-label="Toggle change request explainer"
                        >
                          {showChangeRequestAccordion ? "🤯" : "🤔"}
                        </button>

                        <AccordionBox title="Change Request Review" isOpen={showChangeRequestAccordion}>
                          <p className="text-sm text-gray-600 mb-4">
                            Admin privileges alone aren't enough. Permission changes are staged for review and must reach quorum before they can be committed.
                          </p>
                        </AccordionBox>
                        {
                          requests.map((request, i) => (
                            <QuorumDashboard
                              key={i}
                              request={request}
                              setPage={setPage}
                              setRequests={setRequests}
                              onCommit={() => {
                                const approved = request.value;
                                // const merged = { ...jwt.permissions };

                                // Object.entries(approved).forEach(([field, perms]) => {
                                //   merged[field] = perms;
                                // });

                                // setJwt(prev => ({ ...prev, permissions: merged }));
                                // setRequests(prev => [{
                                //   ...prev[0],
                                //   status: "Committed"
                                // }]);
                                setPage("Admin"); // ensures return to Admin after commit
                              }}
                            />
                          ))
                        }
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="mt-auto p-4 bg-gray-100 flex flex-col md:flex-row justify-between items-center text-sm gap-2 md:gap-0">

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <p>
            Secured by{" "}
            <a href="https://tide.org/tidecloak_product" className="text-blue-600 underline" target="_blank">TideCloak</a>
          </p>
          <a
            href="https://tide.org/beta"
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-blue-500 transition"
            target="_blank"
          >
            Join the Beta program
          </a>
        </div>
        <div className="flex gap-4 text-xl">
          <a
            href="https://discord.gg/XBMd9ny2q5"
            aria-label="Discord"
            className="hover:text-blue-500 transition"
            target="_blank"
          >
            <FaDiscord />
          </a>
          <a
            href="https://twitter.com/tidefoundation"
            aria-label="X (formerly Twitter)"
            className="hover:text-blue-500 transition"
            target="_blank"
          >
            <SiX />
          </a>
          <a
            href="https://www.linkedin.com/company/tide-foundation/"
            aria-label="LinkedIn"
            className="hover:text-blue-500 transition"
            target="_blank"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/tide-foundation/tidecloakspaces"
            aria-label="GitHub"
            className="hover:text-blue-500 transition"
            target="_blank"
          >
            <FaGithub />
          </a>
        </div>
      </footer>

    </div>
  : null
  );
}
