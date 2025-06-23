"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const linkedinAuth_controller_1 = __importDefault(require("../controllers/linkedinAuth.controller"));
const supabase_1 = require("../config/supabase");
const linkedInService_1 = require("../services/linkedInService");
const router = express_1.default.Router();

router.get('/auth/linkedin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isMobile = req.query.from === 'mobile';
        const state = req.query.state || Math.random().toString(36).substring(2, 15);
        // Sabit client id/secret tanımlarını kaldırdım, Supabase panelinden yönetilmeli
        const LINKEDIN_REDIRECT_URI = 'https://aikuaiplatform.com/auth/social-callback';
        const redirectTo = isMobile 
            ? 'testapp://lms/' 
            : LINKEDIN_REDIRECT_URI;
        console.log('[LinkedIn Auth] Initiating OAuth', { 
            redirectTo, 
            isMobile, 
            state,
            userAgent: req.get('User-Agent')
        });
        // Provider'ı linkedin_oidc olarak düzelttim ve redirectTo'yu dinamik gönderdim
        const { data, error } = yield supabase_1.supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo: redirectTo,
                queryParams: {
                    prompt: 'consent',
                    state: `${state}|${isMobile ? 'mobile' : 'web'}`,
                    scope: 'r_liteprofile r_emailaddress'
                },
            },
        });
        if (error) throw error;
        if (!data.url) throw new Error('Auth URL alınamadı');
        console.log('[LinkedIn Auth] Redirecting to:', data.url);
        // Mobile'da URL'i döndür, web'de redirect yap
        if (isMobile && req.get('Accept')?.includes('application/json')) {
            res.json({ url: data.url });
        } else {
            res.redirect(data.url);
        }
    } catch (error) {
        console.error('[LinkedIn Auth] Error:', error);
        const errorUrl = process.env.CLIENT_URL 
            ? `testapp://lms/?error=linkedin-auth-failed`
            : 'testapp://lms/?error=linkedin-auth-failed';
        res.redirect(errorUrl);
    }
}));

router.get('/auth/linkedin/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state, error: oauthError } = req.query;
    console.log('[LinkedIn Callback] Received:', { code, state, oauthError });

    if (oauthError) {
        console.error('[LinkedIn Callback] OAuth error:', oauthError);
        return res.redirect(`yourapp://auth/linkedin-callback?error=${oauthError}`);
    }

    if (!code) {
        console.error('[LinkedIn Callback] No code provided');
        return res.redirect(`yourapp://auth/linkedin-callback?error=no-code`);
    }

    try {
        // State'ten platform bilgisini çıkar
        const [originalState, platform] = (state as string || '').split('|');
        const isMobile = platform === 'mobile';
        
        console.log('[LinkedIn Callback] Platform:', { platform, isMobile });

        // Supabase ile session exchange
        const { data, error } = yield supabase_1.supabase.auth.exchangeCodeForSession(code.toString());
        if (error) throw error;

        console.log('[LinkedIn Callback] Session exchanged:', { 
            userId: data.user?.id,
            email: data.user?.email 
        });

        // LinkedIn service ile kullanıcı bilgilerini işle
        const linkedInService = new linkedInService_1.LinkedInService();
        const authResult = yield linkedInService.handleAuth(data);

        console.log('[LinkedIn Callback] Auth result:', { 
            token: authResult.token ? 'present' : 'missing',
            userId: authResult.user?.id 
        });

        // Mobile ise deep link ile redirect
        if (isMobile) {
            const deepLinkUrl = `yourapp://auth/linkedin-callback?token=${encodeURIComponent(authResult.token)}&user=${encodeURIComponent(JSON.stringify(authResult.user))}&state=${originalState}`;
            console.log('[LinkedIn Callback] Mobile redirect:', deepLinkUrl);
            res.redirect(deepLinkUrl);
        } else {
            // Web ise normal redirect
            const webRedirectUrl = `${process.env.CLIENT_URL || 'https://aikuaiplatform.com'}/auth/callback?token=${authResult.token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}&state=${originalState}`;
            console.log('[LinkedIn Callback] Web redirect:', webRedirectUrl);
            res.redirect(webRedirectUrl);
        }

    } catch (error) {
        console.error('[LinkedIn Callback] Error:', error);
        const errorUrl = `yourapp://auth/linkedin-callback?error=linkedin-callback-failed&message=${encodeURIComponent(error.message || 'Unknown error')}`;
        res.redirect(errorUrl);
    }
}));

// POST endpoint mobil uygulamadan direkt çağrı için
router.post('/auth/linkedin/callback', linkedinAuth_controller_1.default.handleLinkedInCallback);

exports.default = router;